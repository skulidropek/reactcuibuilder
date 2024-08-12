import React, { useRef, useEffect, useCallback } from 'react';
import { observer } from 'mobx-react-lite';
import { Stage, Layer, Rect, Image, Text, Group } from 'react-konva';
import Konva from 'konva';
import { autorun } from 'mobx';
import { rustToRGBA } from '../../utils/colorUtils';

import CuiElementModel from '../../models/CuiElement/CuiElementModel';
import ICuiImageComponent, { ImageType } from '../../models/CuiComponent/ICuiImageComponent';
import CuiImageComponentModel from '../../models/CuiComponent/CuiImageComponentModel';
import CuiButtonComponentModel from '../../models/CuiComponent/CuiButtonComponentModel';
import CuiTextComponentModel from '../../models/CuiComponent/CuiTextComponentModel';
import GraphicEditorStore from './GraphicEditorStore';
import EditorCanvasStore from './EditorCanvasStore';

interface EditorCanvasProps {
  store: GraphicEditorStore;
  canvasStore: EditorCanvasStore;
}

const MemoizedImage = React.memo(Image, (prevProps, nextProps) => {
  return (
    prevProps.image === nextProps.image &&
    prevProps.x === nextProps.x &&
    prevProps.y === nextProps.y &&
    prevProps.width === nextProps.width &&
    prevProps.height === nextProps.height &&
    prevProps.fillPatternRepeat === nextProps.fillPatternRepeat
  );
});

const MemoizedRect = React.memo(Rect, (prevProps, nextProps) => {
  return (
    prevProps.x === nextProps.x &&
    prevProps.y === nextProps.y &&
    prevProps.width === nextProps.width &&
    prevProps.height === nextProps.height &&
    prevProps.fill === nextProps.fill
  );
});

const MemoizedText = React.memo(Text, (prevProps, nextProps) => {
  return (
    prevProps.x === nextProps.x &&
    prevProps.y === nextProps.y &&
    prevProps.text === nextProps.text &&
    prevProps.fontSize === nextProps.fontSize &&
    prevProps.fill === nextProps.fill &&
    prevProps.align === nextProps.align
  );
});

const MemoizedGroup = React.memo(Group);

const EditorCanvas: React.FC<EditorCanvasProps> = observer(({ store, canvasStore }) => {
  const stageRef = useRef<Konva.Stage>(null);

  const renderShape = useCallback((element: CuiElementModel) => {
    if (!element || !element.visible) {
      console.warn('Skipping rendering for invisible or undefined element', element);
      return null;
    }

    const shape = element.rectTransform().generateShapePositions();
    const cuiImageComponent = element.findComponentByTypes<ICuiImageComponent>([
      CuiImageComponentModel,
      CuiButtonComponentModel,
    ]);
    const cuiTextComponent = element.findComponentByType(CuiTextComponentModel);

    const children: JSX.Element[] = [];

    if (cuiImageComponent) {
      if (cuiImageComponent instanceof CuiImageComponentModel && cuiImageComponent.png) {
        const image = canvasStore.preloadedImages.get(cuiImageComponent.png as string) as HTMLImageElement;
        if (image) {
          console.log(`Rendering image for element ${element.id}`);
          children.push(
            <MemoizedImage
              key={`image-${element.id}`}
              image={image}
              x={shape.x}
              y={shape.y + shape.height}
              width={shape.width}
              height={shape.height}
              scaleY={-1} // Отражение по вертикали
              fillPatternImage={image}
              fillPatternRepeat={cuiImageComponent.imageType === ImageType.Tiled ? 'repeat' : 'no-repeat'}
              id={`image-${element.id}`}
              onLoad={() => {
                const cachedImage = stageRef.current?.findOne(`#image-${element.id}`);
                if (cachedImage) {
                  cachedImage.cache();
                }
              }}
            />
          );
        }
      } else {
        console.log(`Rendering rectangle for element ${element.id}`);
        children.push(
          <MemoizedRect
            key={`rect-${element.id}`}
            x={shape.x}
            y={shape.y}
            width={shape.width}
            height={shape.height}
            fill={cuiImageComponent.color ? rustToRGBA(cuiImageComponent.color) : undefined}
          />
        );
      }
    }

    // Рендеринг текста
    if (cuiTextComponent && cuiTextComponent.text && cuiTextComponent.text.trim() !== '') {
      console.log(`Rendering text for element ${element.id}: ${cuiTextComponent.text}`);
      if (stageRef.current) {
        const canvasElement = stageRef.current.toCanvas();
        if (canvasElement) {
          const context = canvasElement.getContext('2d');
          if (context) {
            const textPosition = cuiTextComponent.generateTextPosition(context, cuiTextComponent, shape);
            children.push(
              <MemoizedText
                key={`text-${element.id}`}
                x={textPosition.x}
                y={store.size.height - textPosition.y - textPosition.fontSize / 2}
                text={textPosition.lines.join('\n')}
                fontSize={textPosition.fontSize}
                fill={textPosition.color}
                align={textPosition.textAlign}
                offsetY={-textPosition.fontSize / 2}
                scaleX={1}
                scaleY={-1}
              />
            );
          } else {
            console.error('Cannot get 2D context');
          }
        } else {
          console.error('toCanvas() returned undefined');
        }
      } else {
        console.error('stageRef.current is undefined');
      }
    }

    if (shape.anchor && shape.markers) {
      if (!store.disableAnchor) {
        console.log(`Rendering anchor for element ${element.id}`);
        children.push(
          <MemoizedRect
            key={`anchor-${element.id}`}
            x={shape.anchor.x}
            y={shape.anchor.y}
            width={shape.anchor.width}
            height={shape.anchor.height}
            stroke="blue"
            dash={[5, 5]}
          />
        );
        shape.markers.green.forEach((marker, index) => {
          children.push(
            <MemoizedRect
              key={`green-marker-${element.id}-${index}`}
              x={marker.x - 5}
              y={marker.y - 5}
              width={10}
              height={10}
              fill="green"
            />
          );
        });
        shape.markers.blue.forEach((marker, index) => {
          children.push(
            <MemoizedRect
              key={`blue-marker-${element.id}-${index}`}
              x={marker.x - 5}
              y={marker.y - 5}
              width={10}
              height={10}
              fill="blue"
            />
          );
        });
      }

      if (!store.disableOffset) {
        console.log(`Rendering offset for element ${element.id}`);
        shape.markers.red.forEach((marker, index) => {
          children.push(
            <MemoizedRect
              key={`red-marker-${element.id}-${index}`}
              x={marker.x - 5}
              y={marker.y - 5}
              width={10}
              height={10}
              fill="red"
            />
          );
        });
        shape.markers.yellow.forEach((marker, index) => {
          children.push(
            <MemoizedRect
              key={`yellow-marker-${element.id}-${index}`}
              x={marker.x - 5}
              y={marker.y - 5}
              width={10}
              height={10}
              fill="yellow"
            />
          );
        });
      }
    }

    const childElements = element.children || [];
    console.log(`Rendering group for element ${element.id} with ${childElements.length} children`);

    return (
      <MemoizedGroup key={element.id}>
        {children}
        {childElements.map((child) => child && renderShape(child))}
      </MemoizedGroup>
    );
  }, [canvasStore, store.disableAnchor, store.disableOffset, store.size.height]);

  useEffect(() => {
    const dispose = autorun(() => {
      canvasStore.preloadImages(store.children);
    });

    return () => dispose();
  }, [canvasStore, store.children]);

  const handleMouseDown = (e: Konva.KonvaEventObject<MouseEvent>) => {
    canvasStore.handleMouseDown(
      {
        clientX: e.evt.clientX,
        clientY: e.evt.clientY,
      },
      e.target.getStage()?.container().getBoundingClientRect()
    );
  };

  const handleMouseMove = (e: Konva.KonvaEventObject<MouseEvent>) => {
    if (store.selectedItem) {
      requestAnimationFrame(() => {
        canvasStore.handleMouseMove(
          {
            clientX: e.evt.clientX,
            clientY: e.evt.clientY,
          },
          e.target.getStage()?.container().getBoundingClientRect()
        );
      });
    }
  };

  const handleMouseUp = () => {
    canvasStore.handleMouseUp();
  };

  return (
    <Stage
      width={store.size.width}
      height={store.size.height}
      ref={stageRef}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      style={{ border: '1px solid gray' }}
    >
      <Layer scaleY={-1} y={store.size.height}>
        {store.children.map(renderShape)}
      </Layer>
    </Stage>
  );
});

export default EditorCanvas;
