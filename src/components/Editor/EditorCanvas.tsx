import React, { useState, useRef, useEffect, useCallback } from 'react';
import { observer } from 'mobx-react-lite';
import { autorun } from 'mobx';
import CuiElementModel, { Marker, ShapePosition } from '../../models/CuiElementModel';
import CuiRectTransformModel from '../../models/CuiRectTransformModel';
import GraphicEditorStore from './GraphicEditorStore';
import CuiImageComponentModel from '../../models/CuiImageComponentModel';

interface EditorCanvasProps {
  store: GraphicEditorStore;
}

const EditorCanvas: React.FC<EditorCanvasProps> = observer(({
  store,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [resizing, setResizing] = useState<Marker | null>(null);
  const [imagesLoaded, setImagesLoaded] = useState(false);
  const preloadedImages = useRef(new Map<string, HTMLImageElement>()).current;

  const preloadImages = useCallback(async (items: CuiElementModel[]) => {
    const promises: Promise<void>[] = items.map((item) => {
      const cuiImageComponent = item.findComponentByType(CuiImageComponentModel);
      if (cuiImageComponent?.png && !preloadedImages.has(cuiImageComponent.png)) {
        return new Promise<void>((resolve) => {
          const image = new Image();
          image.src = cuiImageComponent.png as string;
          image.onload = () => {
            preloadedImages.set(cuiImageComponent.png as string, image);
            resolve();
          };
        });
      }
      return Promise.resolve();
    });

    await Promise.all(promises);
    setImagesLoaded(true);
  }, [preloadedImages]);

  const drawShapes = useCallback((context: CanvasRenderingContext2D, items: CuiElementModel[]) => {
    context.clearRect(0, 0, store.size.width, store.size.height);
    context.save();
    context.translate(0, store.size.height);
    context.scale(1, -1);
    
    const drawShape = (element: CuiElementModel) => {
      const shape = element.generateShapePositions();
      if (shape == null) return;

      const cuiImageComponent = element.findComponentByType(CuiImageComponentModel);
      if (cuiImageComponent?.color) {
        context.fillStyle = cuiImageComponent.color;
      }

      context.globalAlpha = 1;
    
      if (cuiImageComponent?.png) {
        const image = preloadedImages.get(cuiImageComponent.png as string);
        if (image) {
          context.save();
          context.scale(1, -1);
          context.drawImage(image, shape.x, -shape.y - shape.height, shape.width, shape.height);
          context.restore();
        }
      } else {
        context.fillRect(shape.x, shape.y, shape.width, shape.height);
      }
    
      if (shape.anchor && shape.markers) {
        context.strokeStyle = 'blue';
        context.setLineDash([5, 5]);
        context.strokeRect(shape.anchor.x, shape.anchor.y, shape.anchor.width, shape.anchor.height);
        context.setLineDash([]);

        shape.markers.blue.forEach(marker => drawMarker(marker.x, marker.y, 'blue'));
        shape.markers.red.forEach(marker => drawMarker(marker.x, marker.y, 'red'));
        shape.markers.green.forEach(marker => drawMarker(marker.x, marker.y, 'green'));
        shape.markers.yellow.forEach(marker => drawMarker(marker.x, marker.y, 'yellow'));
      }
    
      element.children.forEach(drawShape);
    };
    
    const drawMarker = (x: number, y: number, color: string) => {
      context.fillStyle = color;
      context.fillRect(x - 5, y - 5, 10, 10);
    };

    items.forEach(drawShape);

    context.restore();
  }, [preloadedImages, store.size]);

  const getShapeAtCoordinates = useCallback(
    (x: number, y: number, items: CuiElementModel[]): CuiElementModel | null => {
      const findShape = (shapePosition: ShapePosition, shape: CuiElementModel): CuiElementModel | null => {
        const { x: shapeX, y: shapeY, width, height, children } = shapePosition;

        const withinX = x >= shapeX && x <= shapeX + width;
        const withinY = y >= shapeY && y <= shapeY + height;

        for (const child of children) {
          const foundChild = findShape(child, shape.children.find(c => c.id === child.id)!);
          if (foundChild) return foundChild;
        }

        if (withinX && withinY) {
          return shape;
        }

        return null;
      };

      for (let i = items.length - 1; i >= 0; i--) {
        const shapePosition = items[i].generateShapePositions();
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

      const findMarker = (shape: ShapePosition): Marker | null => {
        const { x: shapeX, y: shapeY, width: shapeWidth, height: shapeHeight, anchor, markers } = shape;

        if (anchor) {
          const { x: anchorX, y: anchorY, width: anchorWidth, height: anchorHeight } = anchor;

          if (isClose(x, y, anchorX, anchorY)) return { handle: 'topLeft', isOffset: false, isEdge: false, startX: x, startY: y, element: shape.element };
          if (isClose(x, y, anchorX + anchorWidth, anchorY)) return { handle: 'topRight', isOffset: false, isEdge: false, startX: x, startY: y, element: shape.element };
          if (isClose(x, y, anchorX, anchorY + anchorHeight)) return { handle: 'bottomLeft', isOffset: false, isEdge: false, startX: x, startY: y, element: shape.element };
          if (isClose(x, y, anchorX + anchorWidth, anchorY + anchorHeight)) return { handle: 'bottomRight', isOffset: false, isEdge: false, startX: x, startY: y, element: shape.element };

          if (isClose(x, y, anchorX + anchorWidth / 2, anchorY)) return { handle: 'top', isOffset: false, isEdge: true, startX: x, startY: y, element: shape.element };
          if (isClose(x, y, anchorX + anchorWidth, anchorY + anchorHeight / 2)) return { handle: 'right', isOffset: false, isEdge: true, startX: x, startY: y, element: shape.element };
          if (isClose(x, y, anchorX + anchorWidth / 2, anchorY + anchorHeight)) return { handle: 'bottom', isOffset: false, isEdge: true, startX: x, startY: y, element: shape.element };
          if (isClose(x, y, anchorX, anchorY + anchorHeight / 2)) return { handle: 'left', isOffset: false, isEdge: true, startX: x, startY: y, element: shape.element };
        }

        if (isClose(x, y, shapeX, shapeY)) return { handle: 'topLeft', isOffset: true, isEdge: false, startX: x, startY: y, element: shape.element };
        if (isClose(x, y, shapeX + shapeWidth, shapeY)) return { handle: 'topRight', isOffset: true, isEdge: false, startX: x, startY: y, element: shape.element };
        if (isClose(x, y, shapeX, shapeY + shapeHeight)) return { handle: 'bottomLeft', isOffset: true, isEdge: false, startX: x, startY: y, element: shape.element };
        if (isClose(x, y, shapeX + shapeWidth, shapeY + shapeHeight)) return { handle: 'bottomRight', isOffset: true, isEdge: false, startX: x, startY: y, element: shape.element };

        if (isClose(x, y, shapeX + shapeWidth / 2, shapeY)) return { handle: 'top', isOffset: true, isEdge: true, startX: x, startY: y, element: shape.element };
        if (isClose(x, y, shapeX + shapeWidth, shapeY + shapeHeight / 2)) return { handle: 'right', isOffset: true, isEdge: true, startX: x, startY: y, element: shape.element };
        if (isClose(x, y, shapeX + shapeWidth / 2, shapeY + shapeHeight)) return { handle: 'bottom', isOffset: true, isEdge: true, startX: x, startY: y, element: shape.element };
        if (isClose(x, y, shapeX, shapeY + shapeHeight / 2)) return { handle: 'left', isOffset: true, isEdge: true, startX: x, startY: y, element: shape.element };

        if (markers) {
          for (const markerType of ['blue', 'red', 'green', 'yellow'] as const) {
            for (const marker of markers[markerType]) {
              if (isClose(x, y, marker.x, marker.y)) {
                return { handle: markerType as 'topLeft' | 'topRight' | 'bottomLeft' | 'bottomRight' | 'top' | 'right' | 'bottom' | 'left', isOffset: false, isEdge: false, startX: x, startY: y, element: shape.element };
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

      const shapePositions = items.map(shape => shape.generateShapePositions()).filter((position): position is ShapePosition => position !== null);

      for (let i = shapePositions.length - 1; i >= 0; i--) {
        const marker = findMarker(shapePositions[i]);

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
  }, [store.children, store.size, drawShapes]);

  useEffect(() => {
    preloadImages(store.children);
  }, [store.children, preloadImages]);

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
