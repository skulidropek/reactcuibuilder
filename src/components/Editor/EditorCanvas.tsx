import React, { useState, useRef, useEffect, useCallback } from 'react';
import { observer } from 'mobx-react-lite';
import { autorun, observable } from 'mobx';
import CuiElementModel, { Marker } from '../../models/CuiElement/CuiElementModel';
import CuiRectTransformModel, { ShapePosition } from '../../models/CuiComponent/CuiRectTransformModel';
import GraphicEditorStore from './GraphicEditorStore';
import CuiImageComponentModel from '../../models/CuiComponent/CuiImageComponentModel';
import ICuiImageComponent, { ImageType } from '../../models/CuiComponent/ICuiImageComponent';
import ICuiComponent from '@/models/CuiComponent/ICuiComponent';
import CuiButtonComponent from '../cui/CuiButtonComponent';
import CuiButtonComponentModel from '../../models/CuiComponent/CuiButtonComponentModel';
import { rustToRGBA } from '../../utils/colorUtils';
import CuiTextComponentModel, { TextAnchor, VerticalWrapMode } from '../../models/CuiComponent/CuiTextComponentModel';

interface EditorCanvasProps {
  store: GraphicEditorStore;
}

const EditorCanvas: React.FC<EditorCanvasProps> = observer(({
  store,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [resizing, setResizing] = useState<Marker | null>(null);
  const preloadedImages = useRef(new Map<string, HTMLImageElement>()).current;

  const preloadImages = useCallback((items: CuiElementModel[]) => {
    items.forEach((item) => {
      const cuiImageComponent = item.findComponentByType(CuiImageComponentModel);
      if (cuiImageComponent?.png && !preloadedImages.has(cuiImageComponent.png)) {
          const image = new Image();
          image.src = cuiImageComponent.png as string;
          image.onload = () => {
            preloadedImages.set(cuiImageComponent.png as string, image);
          };
      }
    });
  }, [preloadedImages, store.children]);

  const drawShapes = useCallback((context: CanvasRenderingContext2D, items: CuiElementModel[]) => {

    preloadImages(store.children);
  
    context.clearRect(0, 0, context.canvas.width, context.canvas.height);
    context.save();
    context.translate(0, context.canvas.height);
    context.scale(1, -1);
  
    const drawShape = (element: CuiElementModel) => {

      if(!element.visible) return;

      const shape = element.rectTransform().generateShapePositions();
      if (!shape) return;
  
      const cuiImageComponent = element.findComponentByTypes<ICuiImageComponent>([CuiImageComponentModel, CuiButtonComponentModel]);
      const cuiTextComponent = element.findComponentByType(CuiTextComponentModel);
  
      if (cuiImageComponent) {
        if (cuiImageComponent.color) {
          context.fillStyle = rustToRGBA(cuiImageComponent.color);
        }
  
        context.globalAlpha = 1;
  
        if (cuiImageComponent instanceof CuiImageComponentModel && cuiImageComponent.png) {
          const image = preloadedImages.get(cuiImageComponent.png as string) as HTMLImageElement;
          if (image) {
            context.save();
            context.scale(1, -1);
  
            switch (cuiImageComponent.imageType) {
              case ImageType.Sliced:
                drawSlicedImage(context, image, shape);
                break;
              case ImageType.Tiled:
                drawTiledImage(context, image, shape);
                break;
              case ImageType.Filled:
                drawFilledImage(context, image, shape);
                break;
              default: //ImageType.Simple
                context.drawImage(image, shape.x, -shape.y - shape.height, shape.width, shape.height);
                break;
            }
  
            context.restore();
          }
        } else {
          context.fillRect(shape.x, shape.y, shape.width, shape.height);
        }
      }
  
      if (cuiTextComponent) {
        drawTextComponent(context, cuiTextComponent, shape);
      }
  
      if (shape.anchor && shape.markers) {
        context.strokeStyle = 'blue';
        context.setLineDash([5, 5]);
        context.strokeRect(shape.anchor.x, shape.anchor.y, shape.anchor.width, shape.anchor.height);
        context.setLineDash([]);
  
        shape.markers.blue.forEach(marker => drawMarker(context, marker.x, marker.y, 'blue'));
        shape.markers.red.forEach(marker => drawMarker(context, marker.x, marker.y, 'red'));
        shape.markers.green.forEach(marker => drawMarker(context, marker.x, marker.y, 'green'));
        shape.markers.yellow.forEach(marker => drawMarker(context, marker.x, marker.y, 'yellow'));
      }
  
      element.children.forEach(drawShape);
    };
  
    const drawMarker = (context: CanvasRenderingContext2D, x: number, y: number, color: string) => {
      context.fillStyle = color;
      context.fillRect(x - 5, y - 5, 10, 10);
    };

    const drawTextComponent = (context: CanvasRenderingContext2D, textComponent: CuiTextComponentModel, shape: { x: number; y: number; width: number; height: number }) => {
      context.save();
    
      // Отзеркаливаем контекст обратно для правильной отрисовки текста
      context.translate(0, context.canvas.height);
      context.scale(1, -1);
    
      if(textComponent.color) {
        context.fillStyle = rustToRGBA(textComponent.color);
      }
      
      let fontSize = textComponent.fontSize || 12;
      const minFontSize = 1; // Минимальный размер шрифта
      
      let x = shape.x;
      let y = context.canvas.height - shape.y - shape.height; // Изменено: y теперь указывает на нижнюю границу shape
      const width = shape.width;
      const height = shape.height;
      const padding = 5;
    
      // Определение выравнивания текста
      let textAlign: CanvasTextAlign;
      let verticalAlign: 'top' | 'middle' | 'bottom';
      
      switch (textComponent.align) {
        case TextAnchor.UpperLeft:
        case TextAnchor.MiddleLeft:
        case TextAnchor.LowerLeft:
          textAlign = 'left';
          x += padding;
          break;
        case TextAnchor.UpperCenter:
        case TextAnchor.MiddleCenter:
        case TextAnchor.LowerCenter:
          textAlign = 'center';
          x += width / 2;
          break;
        case TextAnchor.UpperRight:
        case TextAnchor.MiddleRight:
        case TextAnchor.LowerRight:
          textAlign = 'right';
          x += width - padding;
          break;
      }
    
      switch (textComponent.align) {
        case TextAnchor.UpperLeft:
        case TextAnchor.UpperCenter:
        case TextAnchor.UpperRight:
          verticalAlign = 'bottom';
          break;
        case TextAnchor.MiddleLeft:
        case TextAnchor.MiddleCenter:
        case TextAnchor.MiddleRight:
          verticalAlign = 'middle';
          break;
        case TextAnchor.LowerLeft:
        case TextAnchor.LowerCenter:
        case TextAnchor.LowerRight:
          verticalAlign = 'top';
          break;
      }
    
      context.textAlign = textAlign;
      context.textBaseline = 'alphabetic';
    
      // Функция для разбиения текста на строки
      const getLines = (text: string, maxWidth: number): string[] => {
        const words = text.split(' ');
        const lines: string[] = [];
        let currentLine = words[0];
    
        for (let i = 1; i < words.length; i++) {
          const word = words[i];
          const width = context.measureText(currentLine + " " + word).width;
          if (width < maxWidth - 2 * padding) {
            currentLine += " " + word;
          } else {
            lines.push(currentLine);
            currentLine = word;
          }
        }
        lines.push(currentLine);
        return lines;
      };
    
      // Подбор оптимального размера шрифта
      while (fontSize > minFontSize) {
        context.font = `${fontSize}px ${textComponent.font || 'Arial'}`;
        const lines = getLines(textComponent.text, width);
        const totalHeight = lines.length * fontSize * 1.2;
        
        if (totalHeight <= height - 2 * padding) {
          break;
        }
        
        fontSize -= 1;
      }
    
      context.font = `${fontSize}px ${textComponent.font || 'Arial'}`;
      const lines = getLines(textComponent.text, width);
      const lineHeight = fontSize * 1.2;
    
      // Вычисляем начальную позицию Y в зависимости от вертикального выравнивания
      let startY: number;
      const totalTextHeight = lines.length * lineHeight;
      if (verticalAlign === 'top') {
        startY = y + height - padding;
      } else if (verticalAlign === 'middle') {
        startY = y + height / 2 + totalTextHeight / 2;
      } else { // 'bottom'
        startY = y + padding + totalTextHeight;
      }
    
      // Рисуем текст
      lines.forEach((line, index) => {
        const lineY = startY - index * lineHeight;
        context.fillText(line, x, lineY);
      });
    
      context.restore();
    };
  
    items.forEach(drawShape);
  
    context.restore();
  }, [preloadedImages]);
  
  const drawSlicedImage = (context: CanvasRenderingContext2D, image: HTMLImageElement, shape: ShapePosition) => {
    const { x, y, width, height } = shape;
    const borderWidth = 20; // ширина границы
    const borderHeight = 20; // высота границы
    
    // Центральная часть
    context.drawImage(image, borderWidth, borderHeight, image.width - 2 * borderWidth, image.height - 2 * borderHeight,
      x + borderWidth, y + borderHeight, width - 2 * borderWidth, height - 2 * borderHeight);
    
    // Четыре угла
    context.drawImage(image, 0, 0, borderWidth, borderHeight, x, y, borderWidth, borderHeight);
    context.drawImage(image, image.width - borderWidth, 0, borderWidth, borderHeight, x + width - borderWidth, y, borderWidth, borderHeight);
    context.drawImage(image, 0, image.height - borderHeight, borderWidth, borderHeight, x, y + height - borderHeight, borderWidth, borderHeight);
    context.drawImage(image, image.width - borderWidth, image.height - borderHeight, borderWidth, borderHeight, x + width - borderWidth, y + height - borderHeight, borderWidth, borderHeight);
    
    // Боковые стороны
    context.drawImage(image, borderWidth, 0, image.width - 2 * borderWidth, borderHeight, x + borderWidth, y, width - 2 * borderWidth, borderHeight);
    context.drawImage(image, borderWidth, image.height - borderHeight, image.width - 2 * borderWidth, borderHeight, x + borderWidth, y + height - borderHeight, width - 2 * borderWidth, borderHeight);
    context.drawImage(image, 0, borderHeight, borderWidth, image.height - 2 * borderHeight, x, y + borderHeight, borderWidth, height - 2 * borderHeight);
    context.drawImage(image, image.width - borderWidth, borderHeight, borderWidth, image.height - 2 * borderHeight, x + width - borderWidth, y + borderHeight, borderWidth, height - 2 * borderHeight);
  };
  
  const drawTiledImage = (context: CanvasRenderingContext2D, image: HTMLImageElement, shape: ShapePosition) => {
    const pattern = context.createPattern(image, 'repeat');
    if (pattern) {
      context.fillStyle = pattern;
      context.fillRect(shape.x, -shape.y - shape.height, shape.width, shape.height);
    }
  };
  
  const drawFilledImage = (context: CanvasRenderingContext2D, image: HTMLImageElement, shape: ShapePosition) => {
    const { x, y, width, height } = shape;
    context.drawImage(image, x, y, width, height);
  };
  
  
  const getShapeAtCoordinates = useCallback(
    (x: number, y: number, items: CuiElementModel[]): CuiElementModel | null => {
      const findShape = (shapePosition: ShapePosition, shape: CuiElementModel): CuiElementModel | null => {
        const { x: shapeX, y: shapeY, width, height } = shapePosition;

        const withinX = x >= shapeX && x <= shapeX + width;
        const withinY = y >= shapeY && y <= shapeY + height;

        for (const child of shape.children) {
          const foundChild = findShape(child.rectTransform().generateShapePositions(), shape.children.find(c => c.id === child.id)!);
          if (foundChild) return foundChild;
        }

        if (withinX && withinY) {
          return shape;
        }

        return null;
      };

      for (let i = items.length - 1; i >= 0; i--) {
        const shapePosition = items[i].rectTransform().generateShapePositions();
        if (!shapePosition) continue;

        const foundShape = findShape(shapePosition, items[i]);
        if (foundShape) return foundShape;
      }
      
      return null;
    },
    []
  );

  const getMarkerUnderMouse = useCallback(
    (x: number, y: number, items: CuiElementModel[]): Marker | null => {
      const isClose = (x1: number, y1: number, x2: number, y2: number) => Math.abs(x1 - x2) < 10 && Math.abs(y1 - y2) < 10;

      const findMarker = (shape: CuiElementModel): Marker | null => {
        const { x: shapeX, y: shapeY, width: shapeWidth, height: shapeHeight, anchor, markers } = shape.rectTransform().generateShapePositions();

        if (anchor) {
          const { x: anchorX, y: anchorY, width: anchorWidth, height: anchorHeight } = anchor;

          if (isClose(x, y, anchorX, anchorY)) return { handle: 'topLeft', isOffset: false, isEdge: false, startX: x, startY: y, element: shape };
          if (isClose(x, y, anchorX + anchorWidth, anchorY)) return { handle: 'topRight', isOffset: false, isEdge: false, startX: x, startY: y, element: shape };
          if (isClose(x, y, anchorX, anchorY + anchorHeight)) return { handle: 'bottomLeft', isOffset: false, isEdge: false, startX: x, startY: y, element: shape };
          if (isClose(x, y, anchorX + anchorWidth, anchorY + anchorHeight)) return { handle: 'bottomRight', isOffset: false, isEdge: false, startX: x, startY: y, element: shape };

          if (isClose(x, y, anchorX + anchorWidth / 2, anchorY)) return { handle: 'top', isOffset: false, isEdge: true, startX: x, startY: y, element: shape };
          if (isClose(x, y, anchorX + anchorWidth, anchorY + anchorHeight / 2)) return { handle: 'right', isOffset: false, isEdge: true, startX: x, startY: y, element: shape };
          if (isClose(x, y, anchorX + anchorWidth / 2, anchorY + anchorHeight)) return { handle: 'bottom', isOffset: false, isEdge: true, startX: x, startY: y, element: shape };
          if (isClose(x, y, anchorX, anchorY + anchorHeight / 2)) return { handle: 'left', isOffset: false, isEdge: true, startX: x, startY: y, element: shape };
        }

        if (isClose(x, y, shapeX, shapeY)) return { handle: 'topLeft', isOffset: true, isEdge: false, startX: x, startY: y, element: shape };
        if (isClose(x, y, shapeX + shapeWidth, shapeY)) return { handle: 'topRight', isOffset: true, isEdge: false, startX: x, startY: y, element: shape };
        if (isClose(x, y, shapeX, shapeY + shapeHeight)) return { handle: 'bottomLeft', isOffset: true, isEdge: false, startX: x, startY: y, element: shape };
        if (isClose(x, y, shapeX + shapeWidth, shapeY + shapeHeight)) return { handle: 'bottomRight', isOffset: true, isEdge: false, startX: x, startY: y, element: shape };

        if (isClose(x, y, shapeX + shapeWidth / 2, shapeY)) return { handle: 'top', isOffset: true, isEdge: true, startX: x, startY: y, element: shape };
        if (isClose(x, y, shapeX + shapeWidth, shapeY + shapeHeight / 2)) return { handle: 'right', isOffset: true, isEdge: true, startX: x, startY: y, element: shape };
        if (isClose(x, y, shapeX + shapeWidth / 2, shapeY + shapeHeight)) return { handle: 'bottom', isOffset: true, isEdge: true, startX: x, startY: y, element: shape };
        if (isClose(x, y, shapeX, shapeY + shapeHeight / 2)) return { handle: 'left', isOffset: true, isEdge: true, startX: x, startY: y, element: shape };

        if (markers) {
          for (const markerType of ['blue', 'red', 'green', 'yellow'] as const) {
            for (const marker of markers[markerType]) {
              if (isClose(x, y, marker.x, marker.y)) {
                return { handle: markerType as 'topLeft' | 'topRight' | 'bottomLeft' | 'bottomRight' | 'top' | 'right' | 'bottom' | 'left', isOffset: false, isEdge: false, startX: x, startY: y, element: shape };
              }
            }
          }
        }

        for (const child of shape.children) {
          const marker = findMarker(child);
          if (marker) return marker;
        }

        return null;
      };

      for (let i = items.length - 1; i >= 0; i--) {
        const marker = findMarker(items[i]);

        if (marker?.element.selected && marker) return marker;
      }

      return null;
    },
    [store.children]
  );

  const handleMouseDown = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvasBounds = canvasRef.current?.getBoundingClientRect();
    if (!canvasBounds) return;

    const mouseX = e.clientX - canvasBounds.left;
    const mouseY = e.clientY - canvasBounds.top;
    const shape = getShapeAtCoordinates(mouseX, store.size.height - mouseY, store.children);
    const marker = getMarkerUnderMouse(mouseX, store.size.height - mouseY, store.children);

    if (marker) {
      setResizing(marker);
    } else if (shape) {
      store.setSelected(shape);
      store.setDragging({ element: shape, startX: e.clientX, startY: e.clientY });
    } else {
      store.desetSelected();
    }
  }, [getShapeAtCoordinates, getMarkerUnderMouse, store.children, store.size.height]);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!store.selectedItem) return;

    const canvasBounds = canvasRef.current?.getBoundingClientRect();
    if (!canvasBounds) return;

    if (resizing) {
      const currentX = e.clientX - canvasBounds.left;
      const currentY = store.size.height - (e.clientY - canvasBounds.top);

      const rectTransform = resizing.element.findComponentByType(CuiRectTransformModel);
      if (!rectTransform) return;

      rectTransform.resize(resizing.handle, resizing.isOffset, resizing.isEdge, currentX, currentY);
    } else if (store.draggingItem) {
      const rectTransform = store.draggingItem.element.findComponentByType(CuiRectTransformModel);
      if (!rectTransform) return;

      const dx = e.clientX - store.draggingItem.startX;
      const dy = store.draggingItem.startY - e.clientY;

      rectTransform.updatePosition(dx, dy);

      store.setDragging({ element: store.draggingItem.element, startX: e.clientX, startY: e.clientY });
    }
  }, [resizing, store.draggingItem]);

  const handleMouseUp = useCallback(() => {
    store.desetDragging();
    setResizing(null);
  }, [store]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const dispose = autorun(() => {
      if (canvas) {
        const context = canvas.getContext('2d');
        if (context) {
          drawShapes(context, store.children);
        }
      }
    });

    return () => dispose();
  }, [store.children, store.size, drawShapes, preloadedImages]);

  return (
    <canvas
      ref={canvasRef}
      width={store.size.width}
      height={store.size.height}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      style={{ border: '1px solid gray' }}
    />
  );
});

export default EditorCanvas;
