import React, { useEffect, useCallback, useRef, useState } from 'react';
// import { CuiElement, CuiRectTransformModel } from '../models/types';
import CuiElement from '../models/CuiElement';
import CuiRectTransformModel from '../models/CuiRectTransformModel';  
import { toInvertedY, fromInvertedY, findComponentByType, updateComponent } from '../utils/coordinateUtils';

interface EditorCanvasProps {
  editorSize: { width: number; height: number };
  shapes: CuiElement[];
  selectedShape: number | null;
  onShapesChange: (updatedShapes: CuiElement[]) => void;
  setSelectedShape: (selectedShape: number | null) => void;
}

interface TransformValues {
  anchorMin: { x: number; y: number };
  anchorMax: { x: number; y: number };
  offsetMin: { x: number; y: number };
  offsetMax: { x: number; y: number };
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

  const extractTransformValues = useCallback((rectTransform: CuiRectTransformModel): TransformValues => {
    const [anchorMinX, anchorMinY] = rectTransform.anchorMin.split(' ').map(Number);
    const [anchorMaxX, anchorMaxY] = rectTransform.anchorMax.split(' ').map(Number);
    const [offsetMinX, offsetMinY] = rectTransform.offsetMin.split(' ').map(Number);
    const [offsetMaxX, offsetMaxY] = rectTransform.offsetMax.split(' ').map(Number);

    return {
      anchorMin: { x: anchorMinX, y: anchorMinY },
      anchorMax: { x: anchorMaxX, y: anchorMaxY },
      offsetMin: { x: offsetMinX, y: offsetMinY },
      offsetMax: { x: offsetMaxX, y: offsetMaxY },
    };
  }, []);

  const calculatePositionAndSize = useCallback((parentSize: { width: number; height: number }, rectTransform: CuiRectTransformModel, invertedY: boolean = false) => {
    const { anchorMin, anchorMax, offsetMin, offsetMax } = extractTransformValues(rectTransform);

    const x = anchorMin.x * parentSize.width + offsetMin.x;
    const y = invertedY 
      ? fromInvertedY(anchorMax.y * parentSize.height + offsetMin.y, parentSize.height) 
      : anchorMax.y * parentSize.height + offsetMin.y;
    const width = (anchorMax.x - anchorMin.x) * parentSize.width + (offsetMax.x - offsetMin.x);
    const height = (anchorMax.y - anchorMin.y) * parentSize.height + (offsetMax.y - offsetMin.y);

    return { x, y, width, height };
  }, [extractTransformValues]);

  const drawShapes = useCallback((context: CanvasRenderingContext2D, shapes: CuiElement[], parentSize: { width: number; height: number }) => {
    context.clearRect(0, 0, parentSize.width, parentSize.height);
    shapes.forEach(shape => {
      const rectTransform = findComponentByType<CuiRectTransformModel>(shape);
      if (!rectTransform) return;

      const { x, y, width, height } = calculatePositionAndSize(parentSize, rectTransform, true);

      context.fillStyle = shape.id === selectedShape ? 'green' : (shape.type === 'rect' ? 'blue' : 'red');
      context.globalAlpha = 0.7;

      if (shape.type === 'rect') {
        context.fillRect(x, y, width, height);
      } else if (shape.type === 'circle') {
        context.beginPath();
        context.arc(x + width / 2, y + height / 2, Math.min(width, height) / 2, 0, 2 * Math.PI);
        context.fill();
      }
    });
  }, [selectedShape, calculatePositionAndSize]);

  const getShapeAtCoordinates = useCallback((x: number, y: number): CuiElement | null => {
    const invertedY = toInvertedY(y, editorSize.height);
    for (let i = shapes.length - 1; i >= 0; i--) {
      const shape = shapes[i];
      const rectTransform = findComponentByType<CuiRectTransformModel>(shape);
      if (!rectTransform) continue;

      const { x: shapeX, y: shapeY, width: shapeWidth, height: shapeHeight } = calculatePositionAndSize(editorSize, rectTransform);

      if (x >= shapeX && x <= shapeX + shapeWidth && invertedY >= shapeY - shapeHeight && invertedY <= shapeY) {
        return shape;
      }
    }
    return null;
  }, [shapes, editorSize, calculatePositionAndSize]);

  const updateShapePosition = useCallback((shapes: CuiElement[], id: number, clientX: number, clientY: number): CuiElement[] => {
    return shapes.map((shape) => {
      if (shape.id === id) {
        const rectTransform = findComponentByType<CuiRectTransformModel>(shape);
        if (!rectTransform) return shape;

        const { anchorMin, anchorMax } = extractTransformValues(rectTransform);

        const dx = clientX - dragStart.x;
        const dy = dragStart.y - clientY;

        const newAnchorMin = {
          x: ((anchorMin.x * editorSize.width + dx) / editorSize.width).toFixed(3),
          y: ((anchorMin.y * editorSize.height + dy) / editorSize.height).toFixed(3)
        };
        const newAnchorMax = {
          x: ((anchorMax.x * editorSize.width + dx) / editorSize.width).toFixed(3),
          y: ((anchorMax.y * editorSize.height + dy) / editorSize.height).toFixed(3)
        };

       
        const updatedElement = updateComponent<CuiRectTransformModel>(
          shape,
          {
            anchorMin: `${newAnchorMin.x} ${newAnchorMin.y}`,
            anchorMax: `${newAnchorMax.x} ${newAnchorMax.y}`,
            offsetMin: rectTransform.offsetMin,
            offsetMax: rectTransform.offsetMax,
          }
        );

        return updatedElement;
      }
      return shape;
    });
  }, [dragStart, extractTransformValues, editorSize]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging || selectedShape === null) return;

    const canvasBounds = canvasRef.current?.getBoundingClientRect();
    if (!canvasBounds) return;

    const updatedShapes = updateShapePosition(shapes, selectedShape, e.clientX, e.clientY);

    onShapesChange(updatedShapes);
    setDragStart({ x: e.clientX, y: e.clientY });
  }, [isDragging, selectedShape, shapes, onShapesChange, updateShapePosition]);

  const handleMouseDown = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvasBounds = canvasRef.current?.getBoundingClientRect();
    if (!canvasBounds) return;

    const mouseX = e.clientX - canvasBounds.left;
    const mouseY = e.clientY - canvasBounds.top;
    const shape = getShapeAtCoordinates(mouseX, mouseY);

    if (shape) {
      setSelectedShape(shape.id);
      setIsDragging(true);
      setDragStart({ x: e.clientX, y: e.clientY });
    } else {
      setSelectedShape(null);
    }
  }, [getShapeAtCoordinates, setSelectedShape]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
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