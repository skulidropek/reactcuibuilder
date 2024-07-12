import React, { useState, useRef, useEffect, useCallback } from 'react';
import CuiElement from '../models/CuiElement';
import CuiRectTransformModel, { Size } from '../models/CuiRectTransformModel';

interface EditorCanvasProps {
  editorSize: { width: number; height: number };
  shapes: CuiElement[];
  selectedShape: number | null;
  onShapesChange: (updatedShapes: CuiElement[]) => void;
  setSelectedShape: (selectedShape: number | null) => void;
}

interface Marker {
  handle: 'topLeft' | 'topRight' | 'bottomLeft' | 'bottomRight' | 'top' | 'right' | 'bottom' | 'left';
  isOffset: boolean;
  isEdge: boolean;
  startX: number;
  startY: number;
}

const EditorCanvas: React.FC<EditorCanvasProps> = ({
  editorSize,
  shapes,
  selectedShape,
  onShapesChange,
  setSelectedShape,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [resizing, setResizing] = useState<Marker | null>(null);

  const drawShapes = useCallback((context: CanvasRenderingContext2D, shapes: CuiElement[], parentSize: Size) => {
    context.clearRect(0, 0, parentSize.width, parentSize.height);

    // Применение трансформации
    context.save();
    context.translate(0, parentSize.height);
    context.scale(1, -1);

    shapes.forEach(shape => {
      const rectTransform = shape.findComponentByType<CuiRectTransformModel>();
      if (!rectTransform) return;

      const { x, y, width, height } = rectTransform.calculatePositionAndSize(parentSize);

      context.fillStyle = shape.id === selectedShape ? 'green' : (shape.type === 'rect' ? 'blue' : 'red');
      context.globalAlpha = 0.7;

      if (shape.type === 'rect') {
        context.fillRect(x, y, width, height);
      } else if (shape.type === 'circle') {
        context.beginPath();
        context.arc(x + width / 2, y + height / 2, Math.min(width, height) / 2, 0, 2 * Math.PI);
        context.fill();
      }

      if (shape.id === selectedShape) {
        const transformValues = rectTransform.extractTransformValues();
        const anchorX = transformValues.anchorMin.x * parentSize.width;
        const anchorY = transformValues.anchorMin.y * parentSize.height;
        const anchorWidth = (transformValues.anchorMax.x - transformValues.anchorMin.x) * parentSize.width;
        const anchorHeight = (transformValues.anchorMax.y - transformValues.anchorMin.y) * parentSize.height;

        context.strokeStyle = 'blue';
        context.setLineDash([5, 5]);
        context.strokeRect(anchorX, anchorY, anchorWidth, anchorHeight);
        context.setLineDash([]);

        const drawMarker = (x: number, y: number, color: string) => {
          context.fillStyle = color;
          context.fillRect(x - 5, y - 5, 10, 10);
        };

        drawMarker(anchorX, anchorY, 'blue');
        drawMarker(anchorX + anchorWidth, anchorY, 'blue');
        drawMarker(anchorX, anchorY + anchorHeight, 'blue');
        drawMarker(anchorX + anchorWidth, anchorY + anchorHeight, 'blue');

        drawMarker(x, y, 'red');
        drawMarker(x + width, y, 'red');
        drawMarker(x, y + height, 'red');
        drawMarker(x + width, y + height, 'red');

        drawMarker(anchorX + anchorWidth / 2, anchorY, 'green');
        drawMarker(anchorX + anchorWidth, anchorY + anchorHeight / 2, 'green');
        drawMarker(anchorX + anchorWidth / 2, anchorY + anchorHeight, 'green');
        drawMarker(anchorX, anchorY + anchorHeight / 2, 'green');

        drawMarker(x + width / 2, y, 'yellow');
        drawMarker(x + width, y + height / 2, 'yellow');
        drawMarker(x + width / 2, y + height, 'yellow');
        drawMarker(x, y + height / 2, 'yellow');
      }
    });

    // Восстановление состояния контекста
    context.restore();
  }, [selectedShape]);

  const getShapeAtCoordinates = useCallback((x: number, y: number): CuiElement | null => {
    // Применение обратной трансформации
    const transformedY = editorSize.height - y;

    for (let i = shapes.length - 1; i >= 0; i--) {
      const shape = shapes[i];
      const rectTransform = shape.findComponentByType<CuiRectTransformModel>();
      if (!rectTransform) continue;

      const { x: shapeX, y: shapeY, width: shapeWidth, height: shapeHeight } = rectTransform.calculatePositionAndSize(editorSize);

      // Correct the selection logic for inverted coordinates
      const startX = Math.min(shapeX, shapeX + shapeWidth);
      const endX = Math.max(shapeX, shapeX + shapeWidth);
      const startY = Math.min(shapeY, shapeY + shapeHeight);
      const endY = Math.max(shapeY, shapeY + shapeHeight);

      if (x >= startX && x <= endX && transformedY >= startY && transformedY <= endY) {
        return shape;
      }
    }
    return null;
  }, [shapes, editorSize]);

  const updateShapePosition = useCallback((shapes: CuiElement[], id: number, clientX: number, clientY: number): CuiElement[] => {
    return shapes.map((shape) => {
      if (shape.id === id) {
        const rectTransform = shape.findComponentByType<CuiRectTransformModel>();
        if (!rectTransform) return shape;

        const dx = clientX - dragStart.x;
        const dy = dragStart.y - clientY;

        rectTransform.updatePosition(dx, dy, editorSize);

        return shape;
      }
      return shape;
    });
  }, [dragStart, editorSize]);

  const getMarkerUnderMouse = useCallback((x: number, y: number): Marker | null => {
    const handles: Marker['handle'][] = ['topLeft', 'topRight', 'bottomLeft', 'bottomRight', 'top', 'right', 'bottom', 'left'];
    const transformedY = editorSize.height - y;

    for (let i = shapes.length - 1; i >= 0; i--) {
      const shape = shapes[i];
      const rectTransform = shape.findComponentByType<CuiRectTransformModel>();
      if (!rectTransform) continue;

      const { x: shapeX, y: shapeY, width: shapeWidth, height: shapeHeight } = rectTransform.calculatePositionAndSize(editorSize);
      const transformValues = rectTransform.extractTransformValues();
      const anchorX = transformValues.anchorMin.x * editorSize.width;
      const anchorY = transformValues.anchorMin.y * editorSize.height;
      const anchorWidth = (transformValues.anchorMax.x - transformValues.anchorMin.x) * editorSize.width;
      const anchorHeight = (transformValues.anchorMax.y - transformValues.anchorMin.y) * editorSize.height;

      const isClose = (x1: number, y1: number, x2: number, y2: number) => Math.abs(x1 - x2) < 10 && Math.abs(y1 - y2) < 10;

      if (isClose(x, transformedY, anchorX, anchorY)) return { handle: 'topLeft', isOffset: false, isEdge: false, startX: x, startY: transformedY };
      if (isClose(x, transformedY, anchorX + anchorWidth, anchorY)) return { handle: 'topRight', isOffset: false, isEdge: false, startX: x, startY: transformedY };
      if (isClose(x, transformedY, anchorX, anchorY + anchorHeight)) return { handle: 'bottomLeft', isOffset: false, isEdge: false, startX: x, startY: transformedY };
      if (isClose(x, transformedY, anchorX + anchorWidth, anchorY + anchorHeight)) return { handle: 'bottomRight', isOffset: false, isEdge: false, startX: x, startY: transformedY };

      if (isClose(x, transformedY, shapeX, shapeY)) return { handle: 'topLeft', isOffset: true, isEdge: false, startX: x, startY: transformedY };
      if (isClose(x, transformedY, shapeX + shapeWidth, shapeY)) return { handle: 'topRight', isOffset: true, isEdge: false, startX: x, startY: transformedY };
      if (isClose(x, transformedY, shapeX, shapeY + shapeHeight)) return { handle: 'bottomLeft', isOffset: true, isEdge: false, startX: x, startY: transformedY };
      if (isClose(x, transformedY, shapeX + shapeWidth, shapeY + shapeHeight)) return { handle: 'bottomRight', isOffset: true, isEdge: false, startX: x, startY: transformedY };

      if (isClose(x, transformedY, anchorX + anchorWidth / 2, anchorY)) return { handle: 'top', isOffset: false, isEdge: true, startX: x, startY: transformedY };
      if (isClose(x, transformedY, anchorX + anchorWidth, anchorY + anchorHeight / 2)) return { handle: 'right', isOffset: false, isEdge: true, startX: x, startY: transformedY };
      if (isClose(x, transformedY, anchorX + anchorWidth / 2, anchorY + anchorHeight)) return { handle: 'bottom', isOffset: false, isEdge: true, startX: x, startY: transformedY };
      if (isClose(x, transformedY, anchorX, anchorY + anchorHeight / 2)) return { handle: 'left', isOffset: false, isEdge: true, startX: x, startY: transformedY };

      if (isClose(x, transformedY, shapeX + shapeWidth / 2, shapeY)) return { handle: 'top', isOffset: true, isEdge: true, startX: x, startY: transformedY };
      if (isClose(x, transformedY, shapeX + shapeWidth, shapeY + shapeHeight / 2)) return { handle: 'right', isOffset: true, isEdge: true, startX: x, startY: transformedY };
      if (isClose(x, transformedY, shapeX + shapeWidth / 2, shapeY + shapeHeight)) return { handle: 'bottom', isOffset: true, isEdge: true, startX: x, startY: transformedY };
      if (isClose(x, transformedY, shapeX, shapeY + shapeHeight / 2)) return { handle: 'left', isOffset: true, isEdge: true, startX: x, startY: transformedY };
    }

    return null;
  }, [shapes, editorSize]);

  const handleMouseDown = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvasBounds = canvasRef.current?.getBoundingClientRect();
    if (!canvasBounds) return;

    const mouseX = e.clientX - canvasBounds.left;
    const mouseY = e.clientY - canvasBounds.top;
    const shape = getShapeAtCoordinates(mouseX, mouseY);
    const marker = getMarkerUnderMouse(mouseX, mouseY);

    if (marker) {
      setResizing(marker);
    } else if (shape) {
      setSelectedShape(shape.id);
      setIsDragging(true);
      setDragStart({ x: e.clientX, y: e.clientY });
    } else {
      setSelectedShape(null);
    }
  }, [getShapeAtCoordinates, getMarkerUnderMouse, setSelectedShape]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (resizing) {
      const canvasBounds = canvasRef.current?.getBoundingClientRect();
      if (!canvasBounds) return;

      const currentX = e.clientX - canvasBounds.left;
      const currentY = e.clientY - canvasBounds.top;

      const updatedShapes = shapes.map((shape) => {
        if (shape.id === selectedShape) {
          const rectTransform = shape.findComponentByType<CuiRectTransformModel>();
          if (!rectTransform) return shape;

          rectTransform.resize(resizing.handle, resizing.isOffset, resizing.isEdge, currentX, editorSize.height - currentY, editorSize);

          return shape;
        }
        return shape;
      });
      onShapesChange(updatedShapes);
    } else if (isDragging && selectedShape !== null) {
      const canvasBounds = canvasRef.current?.getBoundingClientRect();
      if (!canvasBounds) return;

      const updatedShapes = updateShapePosition(shapes, selectedShape, e.clientX, e.clientY);

      onShapesChange(updatedShapes);
      setDragStart({ x: e.clientX, y: e.clientY });
    }
  }, [resizing, isDragging, selectedShape, shapes, onShapesChange, updateShapePosition, editorSize]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    setResizing(null);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      const context = canvas.getContext('2d');
      if (context) {
        drawShapes(context, shapes, editorSize);
      }
    }
  }, [shapes, editorSize, drawShapes]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      canvas.addEventListener('mousemove', handleMouseMove);
      canvas.addEventListener('mouseup', handleMouseUp);
      canvas.addEventListener('mouseleave', handleMouseUp);
    }
    return () => {
      if (canvas) {
        canvas.removeEventListener('mousemove', handleMouseMove);
        canvas.removeEventListener('mouseup', handleMouseUp);
        canvas.removeEventListener('mouseleave', handleMouseUp);
      }
    };
  }, [handleMouseMove, handleMouseUp]);

  return (
    <canvas
      ref={canvasRef}
      width={editorSize.width}
      height={editorSize.height}
      onMouseDown={handleMouseDown}
      style={{ border: '1px solid gray' }}
    />
  );
};

export default EditorCanvas;
