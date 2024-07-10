import React, { useEffect, useCallback, useRef, useState } from 'react';
import { CuiElement, CuiRectTransformModel, findComponentByType } from '../models/types';
import { toInvertedY, fromInvertedY } from '../utils/coordinateUtils';  // Импортируем утилиты

interface EditorCanvasProps {
  editorSize: { width: number; height: number };
  shapes: CuiElement[];
  selectedShape: number | null;
  onShapesChange: (updatedShapes: CuiElement[]) => void;
  setSelectedShape: (selectedShape: number | null) => void;
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

  const drawShapes = useCallback((context: CanvasRenderingContext2D, shapes: CuiElement[], parentWidth: number, parentHeight: number) => {
    context.clearRect(0, 0, parentWidth, parentHeight);
    shapes.forEach(shape => {
      const rectTransform = findComponentByType<CuiRectTransformModel>(shape);
  
      if (!rectTransform) return;
  
      const [anchorMinX, anchorMinY] = rectTransform.anchorMin.split(' ').map(Number);
      const [anchorMaxX, anchorMaxY] = rectTransform.anchorMax.split(' ').map(Number);
      const [offsetMinX, offsetMinY] = rectTransform.offsetMin.split(' ').map(Number);
      const [offsetMaxX, offsetMaxY] = rectTransform.offsetMax.split(' ').map(Number);
  
      // Преобразование координат и размеров
      const x = anchorMinX * parentWidth + offsetMinX;
      const y =  fromInvertedY(anchorMaxY * parentHeight + offsetMinY, parentHeight); // Инвертируем координату Y
      const width = (anchorMaxX - anchorMinX) * parentWidth + (offsetMaxX - offsetMinX);
      const height = (anchorMaxY - anchorMinY) * parentHeight + (offsetMaxY - offsetMinY);
  
      context.fillStyle = shape.id === selectedShape ? 'green' : (shape.type === 'rect' ? 'blue' : 'red');
      context.globalAlpha = 0.7;
  
      if (shape.type === 'rect') {
        context.fillRect(x, y, width, height); // Используем инвертированную координату Y
      } else if (shape.type === 'circle') {
        context.beginPath();
        context.arc(x + width / 2, y + height / 2, Math.min(width, height) / 2, 0, 2 * Math.PI);
        context.fill();
      }
    });
  }, [selectedShape]);

  const getShapeAtCoordinates = useCallback((x: number, y: number): CuiElement | null => {
    const invertedY = toInvertedY(y, editorSize.height);
    for (let i = shapes.length - 1; i >= 0; i--) {
      const shape = shapes[i];
      const rectTransform = findComponentByType<CuiRectTransformModel>(shape);
  
      if (!rectTransform) continue;
  
      const [anchorMinX, anchorMinY] = rectTransform.anchorMin.split(' ').map(Number);
      const [anchorMaxX, anchorMaxY] = rectTransform.anchorMax.split(' ').map(Number);
      const [offsetMinX, offsetMinY] = rectTransform.offsetMin.split(' ').map(Number);
      const [offsetMaxX, offsetMaxY] = rectTransform.offsetMax.split(' ').map(Number);
  
      console.log(`shapeY = ${anchorMinY} * ${editorSize.height} + ${offsetMinY} = ${anchorMinY * editorSize.height + offsetMinY}`)

      const shapeX = anchorMinX * editorSize.width + offsetMinX;
      const shapeY = anchorMaxY * editorSize.height + offsetMinY;
      const shapeWidth = (anchorMaxX - anchorMinX) * editorSize.width + (offsetMaxX - offsetMinX);
      const shapeHeight = (anchorMaxY - anchorMinY) * editorSize.height + (offsetMaxY - offsetMinY);
  
      console.log(`${x} >= ${shapeX} && ${x} <= ${shapeX + shapeWidth} && ${invertedY} >= ${shapeY - shapeHeight} && ${invertedY} <= ${shapeY}`)

      if (x >= shapeX && x <= shapeX + shapeWidth && invertedY >= shapeY - shapeHeight && invertedY <= shapeY) {
        return shape;
      }
    }
    return null;
  }, [shapes, editorSize]);  

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isDragging || selectedShape === null) return;

      const canvasBounds = canvasRef.current?.getBoundingClientRect();
      if (!canvasBounds) return;

      const updatedShapes = updateShapePosition(
        shapes,
        selectedShape,
        e.clientX,
        e.clientY,
        editorSize.width,
        editorSize.height
      );

      onShapesChange(updatedShapes);
      setDragStart({ x: e.clientX, y: e.clientY });
    },
    [isDragging, selectedShape, dragStart, editorSize, shapes, onShapesChange]
  );

  const handleMouseDown = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      const canvasBounds = canvasRef.current?.getBoundingClientRect();
      if (!canvasBounds) return;

      const mouseX = e.clientX - canvasBounds.left;
      const mouseY = e.clientY - canvasBounds.top;
      const shape = getShapeAtCoordinates(mouseX, mouseY);

      console.log(mouseX, mouseY, shape)

      if (shape) {
        setSelectedShape(shape.id);
        setIsDragging(true);
        setDragStart({ x: e.clientX, y: e.clientY });
      } else {
        setSelectedShape(null);
      }
    },
    [getShapeAtCoordinates, setSelectedShape]
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const updateShapePosition = useCallback(
    (
      shapes: CuiElement[],
      id: number,
      clientX: number,
      clientY: number,
      parentWidth: number,
      parentHeight: number
    ): CuiElement[] => {
      return shapes.map((shape) => {
        if (shape.id === id) {
          const rectTransform = findComponentByType<CuiRectTransformModel>(shape);

          if (!rectTransform) return shape;

          const [anchorMinX, anchorMinY] = rectTransform.anchorMin.split(' ').map(Number);
          const [anchorMaxX, anchorMaxY] = rectTransform.anchorMax.split(' ').map(Number);

          const dx = clientX - dragStart.x;
          const dy = dragStart.y - clientY; // Invert dy to match the canvas coordinates

          const newAnchorMinX = ((anchorMinX * parentWidth + dx) / parentWidth).toFixed(3);
          const newAnchorMinY = ((anchorMinY * parentHeight + dy) / parentHeight).toFixed(3);
          const newAnchorMaxX = ((anchorMaxX * parentWidth + dx) / parentWidth).toFixed(3);
          const newAnchorMaxY = ((anchorMaxY * parentHeight + dy) / parentHeight).toFixed(3);

          const updatedComponents = shape.components.map(component => {
            if (component.type === 'RectTransform') {
              return {
                ...component,
                anchorMin: `${newAnchorMinX} ${newAnchorMinY}`,
                anchorMax: `${newAnchorMaxX} ${newAnchorMaxY}`,
                offsetMin: rectTransform.offsetMin,
                offsetMax: rectTransform.offsetMax,
              };
            }
            return component;
          });

          return {
            ...shape,
            components: updatedComponents,
          };
        }
        return shape;
      });
    },
    [dragStart]
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      const context = canvas.getContext('2d');
      if (context) {
        drawShapes(context, shapes, editorSize.width, editorSize.height);
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
