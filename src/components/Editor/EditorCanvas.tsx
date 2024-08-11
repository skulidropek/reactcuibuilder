// EditorCanvas.tsx
import React, { useRef, useEffect, useCallback } from 'react';
import { observer } from 'mobx-react-lite';
import CuiElementModel from '../../models/CuiElement/CuiElementModel';
import CuiRectTransformModel, { ShapePosition } from '../../models/CuiComponent/CuiRectTransformModel';
import GraphicEditorStore from './GraphicEditorStore';
import EditorCanvasStore from './EditorCanvasStore';
import CuiImageComponentModel from '../../models/CuiComponent/CuiImageComponentModel';
import ICuiImageComponent, { ImageType } from '../../models/CuiComponent/ICuiImageComponent';
import CuiButtonComponentModel from '../../models/CuiComponent/CuiButtonComponentModel';
import { rustToRGBA } from '../../utils/colorUtils';
import CuiTextComponentModel, { TextPosition } from '../../models/CuiComponent/CuiTextComponentModel';
import { autorun } from 'mobx';

interface EditorCanvasProps {
  store: GraphicEditorStore;
}

const EditorCanvas: React.FC<EditorCanvasProps> = observer(({ store }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const canvasStore = new EditorCanvasStore(store);

  const drawShapes = useCallback(
    (context: CanvasRenderingContext2D, items: CuiElementModel[]) => {
      canvasStore.preloadImages(store.children);

      context.clearRect(0, 0, context.canvas.width, context.canvas.height);
      context.save();
      context.translate(0, context.canvas.height);
      context.scale(1, -1);

      const drawShape = (element: CuiElementModel) => {
        if (!element.visible) return;

        const shape = element.rectTransform().generateShapePositions();

        const cuiImageComponent = element.findComponentByTypes<ICuiImageComponent>([
          CuiImageComponentModel,
          CuiButtonComponentModel,
        ]);
        const cuiTextComponent = element.findComponentByType(CuiTextComponentModel);

        if (cuiImageComponent) {
          if (cuiImageComponent.color) {
            context.fillStyle = rustToRGBA(cuiImageComponent.color);
          }

          context.globalAlpha = 1;

          if (cuiImageComponent instanceof CuiImageComponentModel && cuiImageComponent.png) {
            const image = canvasStore.preloadedImages.get(cuiImageComponent.png as string) as HTMLImageElement;
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
                default: // ImageType.Simple
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
          drawTextComponent(context, cuiTextComponent.generateTextPosition(context, cuiTextComponent, shape));
        }

        if (shape.anchor && shape.markers) {
          if (!store.disableAnchor) {
            context.strokeStyle = 'blue';
            context.setLineDash([5, 5]);
            context.strokeRect(shape.anchor.x, shape.anchor.y, shape.anchor.width, shape.anchor.height);
            context.setLineDash([]);

            shape.markers.green.forEach((marker) => drawMarker(context, marker.x, marker.y, 'green'));
            shape.markers.blue.forEach((marker) => drawMarker(context, marker.x, marker.y, 'blue'));
          }

          if (!store.disableOffset) {
            shape.markers.red.forEach((marker) => drawMarker(context, marker.x, marker.y, 'red'));
            shape.markers.yellow.forEach((marker) => drawMarker(context, marker.x, marker.y, 'yellow'));
          }
        }

        element.children.forEach(drawShape);
      };

      const drawMarker = (context: CanvasRenderingContext2D, x: number, y: number, color: string) => {
        context.fillStyle = color;
        context.fillRect(x - 5, y - 5, 10, 10);
      };

      const drawTextComponent = (context: CanvasRenderingContext2D, renderModel: TextPosition) => {
        context.save();

        // Отзеркаливаем контекст обратно для правильной отрисовки текста
        context.translate(0, context.canvas.height);
        context.scale(1, -1);

        if (renderModel.color) {
          context.fillStyle = renderModel.color;
        }

        context.textAlign = renderModel.textAlign;
        context.textBaseline = 'alphabetic';
        context.font = `${renderModel.fontSize}px Arial`;

        // Рисуем текст
        renderModel.lines.forEach((line, index) => {
          const lineY = renderModel.y - index * renderModel.lineHeight;
          context.fillText(line, renderModel.x, lineY);
        });

        context.restore();
      };

      const drawSlicedImage = (context: CanvasRenderingContext2D, image: HTMLImageElement, shape: ShapePosition) => {
        const { x, y, width, height } = shape;
        const borderWidth = 20; // ширина границы
        const borderHeight = 20; // высота границы

        // Центральная часть
        context.drawImage(
          image,
          borderWidth,
          borderHeight,
          image.width - 2 * borderWidth,
          image.height - 2 * borderHeight,
          x + borderWidth,
          y + borderHeight,
          width - 2 * borderWidth,
          height - 2 * borderHeight
        );

        // Четыре угла
        context.drawImage(image, 0, 0, borderWidth, borderHeight, x, y, borderWidth, borderHeight);
        context.drawImage(
          image,
          image.width - borderWidth,
          0,
          borderWidth,
          borderHeight,
          x + width - borderWidth,
          y,
          borderWidth,
          borderHeight
        );
        context.drawImage(
          image,
          0,
          image.height - borderHeight,
          borderWidth,
          borderHeight,
          x,
          y + height - borderHeight,
          borderWidth,
          borderHeight
        );
        context.drawImage(
          image,
          image.width - borderWidth,
          image.height - borderHeight,
          borderWidth,
          borderHeight,
          x + width - borderWidth,
          y + height - borderHeight,
          borderWidth,
          borderHeight
        );

        // Боковые стороны
        context.drawImage(
          image,
          borderWidth,
          0,
          image.width - 2 * borderWidth,
          borderHeight,
          x + borderWidth,
          y,
          width - 2 * borderWidth,
          borderHeight
        );
        context.drawImage(
          image,
          borderWidth,
          image.height - borderHeight,
          image.width - 2 * borderWidth,
          borderHeight,
          x + borderWidth,
          y + height - borderHeight,
          width - 2 * borderWidth,
          borderHeight
        );
        context.drawImage(
          image,
          0,
          borderHeight,
          borderWidth,
          image.height - 2 * borderHeight,
          x,
          y + borderHeight,
          borderWidth,
          height - 2 * borderHeight
        );
        context.drawImage(
          image,
          image.width - borderWidth,
          borderHeight,
          borderWidth,
          image.height - 2 * borderHeight,
          x + width - borderWidth,
          y + borderHeight,
          borderWidth,
          height - 2 * borderHeight
        );
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

      items.forEach(drawShape);

      context.restore();
    },
    [canvasStore, store.children]
  );

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvasBounds = canvasRef.current?.getBoundingClientRect();
    canvasStore.handleMouseDown(e, canvasBounds);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvasBounds = canvasRef.current?.getBoundingClientRect();
    canvasStore.handleMouseMove(e, canvasBounds);
  };

  const handleMouseUp = () => {
    canvasStore.handleMouseUp();
  };

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
  }, [store.children, store.size, drawShapes]);

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
