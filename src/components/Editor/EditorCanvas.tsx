import React, { useRef, useEffect, useCallback } from 'react';
import { observer } from 'mobx-react-lite';
import { Stage, Layer, Rect, Image, Text, Group } from 'react-konva';
import Konva from 'konva';
import CuiElementModel from '../../models/CuiElement/CuiElementModel';
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
  canvasStore: EditorCanvasStore;
}

const EditorCanvas: React.FC<EditorCanvasProps> = observer(({ store, canvasStore }) => {
  const stageRef = useRef<Konva.Stage>(null);

  const renderShape = useCallback((element: CuiElementModel) => {
    if (!element.visible) return null;

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
          children.push(
            <Image
              key={`image-${element.id}`}
              image={image}
              x={shape.x}
              y={shape.y}
              width={shape.width}
              height={shape.height}
              fillPatternImage={image}
              fillPatternRepeat={cuiImageComponent.imageType === ImageType.Tiled ? 'repeat' : 'no-repeat'}
            />
          );
        }
      } else {
        children.push(
          <Rect
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

    if (cuiTextComponent) {
      const textPosition = cuiTextComponent.generateTextPosition(
        stageRef.current?.toCanvas().getContext('2d')!,
        cuiTextComponent,
        shape
      );
      children.push(
        <Text
          key={`text-${element.id}`}
          x={textPosition.x}
          y={textPosition.y}
          text={textPosition.lines.join('\n')}
          fontSize={textPosition.fontSize}
          fill={textPosition.color}
          align={textPosition.textAlign}
        />
      );
    }

    if (shape.anchor && shape.markers) {
      if (!store.disableAnchor) {
        children.push(
          <Rect
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
            <Rect
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
            <Rect
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
        shape.markers.red.forEach((marker, index) => {
          children.push(
            <Rect
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
            <Rect
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

    return (
      <Group key={element.id}>
        {children}
        {element.children.map(renderShape)}
      </Group>
    );
  }, [canvasStore, store.disableAnchor, store.disableOffset]);

  useEffect(() => {
    const dispose = autorun(() => {
      canvasStore.preloadImages(store.children);
    });

    return () => dispose();
  }, [canvasStore, store.children]);

  const handleMouseDown = (e: Konva.KonvaEventObject<MouseEvent>) => {
    canvasStore.handleMouseDown({
      clientX: e.evt.clientX,
      clientY: e.evt.clientY
  }, e.target.getStage()?.container().getBoundingClientRect());
  };

  const handleMouseMove = (e: Konva.KonvaEventObject<MouseEvent>) => {
    canvasStore.handleMouseMove({
        clientX: e.evt.clientX,
        clientY: e.evt.clientY
    }, e.target.getStage()?.container().getBoundingClientRect());
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