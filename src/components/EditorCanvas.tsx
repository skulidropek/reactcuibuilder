import React, { useState, useRef, useEffect, useCallback } from 'react';
import CuiElement, { ShapePosition } from '../models/CuiElement';
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

  const drawShapes = useCallback((context: CanvasRenderingContext2D, shapes: ShapePosition[]) => {
    context.clearRect(0, 0, editorSize.width, editorSize.height);
    context.save();
    context.translate(0, editorSize.height);
    context.scale(1, -1);

    const drawShape = (shape: ShapePosition) => {
      context.fillStyle = shape.selected ? 'green' : (shape.type === 'rect' ? 'blue' : 'red');
      context.globalAlpha = 1;

      if (shape.type === 'rect') {
        context.fillRect(shape.x, shape.y, shape.width, shape.height);
      } else if (shape.type === 'circle') {
        context.beginPath();
        context.arc(shape.x + shape.width / 2, shape.y + shape.height / 2, Math.min(shape.width, shape.height) / 2, 0, 2 * Math.PI);
        context.fill();
      }

      if (shape.selected && shape.anchor && shape.markers) {
        context.strokeStyle = 'blue';
        context.setLineDash([5, 5]);
        context.strokeRect(shape.anchor.x, shape.anchor.y, shape.anchor.width, shape.anchor.height);
        context.setLineDash([]);

        shape.markers.blue.forEach(marker => drawMarker(marker.x, marker.y, 'blue'));
        shape.markers.red.forEach(marker => drawMarker(marker.x, marker.y, 'red'));
        shape.markers.green.forEach(marker => drawMarker(marker.x, marker.y, 'green'));
        shape.markers.yellow.forEach(marker => drawMarker(marker.x, marker.y, 'yellow'));
      }

      shape.children.forEach(drawShape);
    };

    const drawMarker = (x: number, y: number, color: string) => {
      context.fillStyle = color;
      context.fillRect(x - 5, y - 5, 10, 10);
    };

    shapes.forEach(drawShape);

    context.restore();
  }, [editorSize]);

  const getShapeAtCoordinates = useCallback(
    (x: number, y: number, shapes: CuiElement[], parentSize: Size): CuiElement | null => {
      const findShape = (shape: CuiElement, parentSize: Size, offsetX: number = 0, offsetY: number = 0): CuiElement | null => {
        const rectTransform = shape.findComponentByType<CuiRectTransformModel>();
        if (!rectTransform) return null;

        const { x: shapeX, y: shapeY, width, height } = rectTransform.calculatePositionAndSize(parentSize, offsetX, offsetY);

        // Check if the coordinates are within this shape
        const withinX = x >= shapeX && x <= shapeX + width;
        const withinY = y >= shapeY && y <= shapeY + height;

        // If not, recursively check children
        for (const child of shape.children) {
          const foundChild = findShape(child, { width, height }, shapeX, shapeY);
          if (foundChild) return foundChild;
        }

        if (withinX && withinY) {
          return shape;
        }

        return null;
      };

      for (const shape of shapes) {
        const foundShape = findShape(shape, parentSize);
        if (foundShape) return foundShape;
      }

      return null;
    },
    []
  );

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
      shape.children = updateShapePosition(shape.children, id, clientX, clientY);
      return shape;
    });
  }, [dragStart, editorSize]);

  const getMarkerUnderMouse = useCallback((x: number, y: number, shapes: CuiElement[], parentSize: Size, offsetX = 0, offsetY = 0): Marker | null => {

    for (let i = shapes.length - 1; i >= 0; i--) {
      const shape = shapes[i];
      const rectTransform = shape.findComponentByType<CuiRectTransformModel>();
      if (!rectTransform) continue;

      const { x: shapeX, y: shapeY, width: shapeWidth, height: shapeHeight } = rectTransform.calculatePositionAndSize(parentSize);
      const transformValues = rectTransform.extractTransformValues();
      const anchorX = transformValues.anchorMin.x * parentSize.width + offsetX;
      const anchorY = transformValues.anchorMin.y * parentSize.height + offsetY;
      const anchorWidth = (transformValues.anchorMax.x - transformValues.anchorMin.x) * parentSize.width;
      const anchorHeight = (transformValues.anchorMax.y - transformValues.anchorMin.y) * parentSize.height;

      const isClose = (x1: number, y1: number, x2: number, y2: number) => Math.abs(x1 - x2) < 10 && Math.abs(y1 - y2) < 10;

      if (isClose(x, y, anchorX, anchorY)) return { handle: 'topLeft', isOffset: false, isEdge: false, startX: x, startY: y };
      if (isClose(x, y, anchorX + anchorWidth, anchorY)) return { handle: 'topRight', isOffset: false, isEdge: false, startX: x, startY: y };
      if (isClose(x, y, anchorX, anchorY + anchorHeight)) return { handle: 'bottomLeft', isOffset: false, isEdge: false, startX: x, startY: y };
      if (isClose(x, y, anchorX + anchorWidth, anchorY + anchorHeight)) return { handle: 'bottomRight', isOffset: false, isEdge: false, startX: x, startY: y };

      if (isClose(x, y, shapeX, shapeY)) return { handle: 'topLeft', isOffset: true, isEdge: false, startX: x, startY: y };
      if (isClose(x, y, shapeX + shapeWidth, shapeY)) return { handle: 'topRight', isOffset: true, isEdge: false, startX: x, startY: y };
      if (isClose(x, y, shapeX, shapeY + shapeHeight)) return { handle: 'bottomLeft', isOffset: true, isEdge: false, startX: x, startY: y };
      if (isClose(x, y, shapeX + shapeWidth, shapeY + shapeHeight)) return { handle: 'bottomRight', isOffset: true, isEdge: false, startX: x, startY: y };

      if (isClose(x, y, anchorX + anchorWidth / 2, anchorY)) return { handle: 'top', isOffset: false, isEdge: true, startX: x, startY: y };
      if (isClose(x, y, anchorX + anchorWidth, anchorY + anchorHeight / 2)) return { handle: 'right', isOffset: false, isEdge: true, startX: x, startY: y };
      if (isClose(x, y, anchorX + anchorWidth / 2, anchorY + anchorHeight)) return { handle: 'bottom', isOffset: false, isEdge: true, startX: x, startY: y };
      if (isClose(x, y, anchorX, anchorY + anchorHeight / 2)) return { handle: 'left', isOffset: false, isEdge: true, startX: x, startY: y };

      if (isClose(x, y, shapeX + shapeWidth / 2, shapeY)) return { handle: 'top', isOffset: true, isEdge: true, startX: x, startY: y };
      if (isClose(x, y, shapeX + shapeWidth, shapeY + shapeHeight / 2)) return { handle: 'right', isOffset: true, isEdge: true, startX: x, startY: y };
      if (isClose(x, y, shapeX + shapeWidth / 2, shapeY + shapeHeight)) return { handle: 'bottom', isOffset: true, isEdge: true, startX: x, startY: y };
      if (isClose(x, y, shapeX, shapeY + shapeHeight / 2)) return { handle: 'left', isOffset: true, isEdge: true, startX: x, startY: y };
    }

    return null;
  }, [shapes, editorSize]);

  const handleMouseDown = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvasBounds = canvasRef.current?.getBoundingClientRect();
    if (!canvasBounds) return;

    const mouseX = e.clientX - canvasBounds.left;
    const mouseY = e.clientY - canvasBounds.top;
    const shape = getShapeAtCoordinates(mouseX, editorSize.height - mouseY, shapes, editorSize);
    const marker = getMarkerUnderMouse(mouseX, editorSize.height - mouseY, shapes, editorSize);

    if (marker) {
      setResizing(marker);
    } else if (shape) {
      shape.selected = true;
      const updatedShapes = shapes.map(s => {
        if (s.id === shape.id) {
          return shape;
        } else {
          s.selected = false;
          return s;
        }
      });

      setSelectedShape(shape.id);
      onShapesChange(updatedShapes);
      setIsDragging(true);
      setDragStart({ x: e.clientX, y: e.clientY });
    } else {
      const updatedShapes = shapes.map(s => {
        s.selected = false;
        return s;
      });

      setSelectedShape(null);
      onShapesChange(updatedShapes);
    }
  }, [getShapeAtCoordinates, getMarkerUnderMouse, setSelectedShape, onShapesChange, shapes]);

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
        const shapePositions = shapes.map(shape => shape.generateShapePositions(editorSize)).filter((position): position is ShapePosition => position !== null);
        drawShapes(context, shapePositions);
      }
    }
  }, [shapes, editorSize, selectedShape, drawShapes]);

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
