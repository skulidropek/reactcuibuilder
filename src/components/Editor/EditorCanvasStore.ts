// EditorCanvasStore.ts
import { observable, action } from 'mobx';
import CuiElementModel, { Marker } from '../../models/CuiElement/CuiElementModel';
import CuiImageComponentModel from '../../models/CuiComponent/CuiImageComponentModel';
import GraphicEditorStore from './GraphicEditorStore';
import CuiRectTransformModel, { ShapePosition } from '../../models/CuiComponent/CuiRectTransformModel';

class EditorCanvasStore {
  @observable resizing: Marker | null = null;
  preloadedImages = new Map<string, HTMLImageElement>();

  constructor(private graphicEditorStore: GraphicEditorStore) {}

  @action setResizing(marker: Marker | null) {
    this.resizing = marker;
  }

  @action preloadImages(items: CuiElementModel[]) {
    items.forEach((item) => {
      const cuiImageComponent = item.findComponentByType(CuiImageComponentModel);
      if (cuiImageComponent?.png && !this.preloadedImages.has(cuiImageComponent.png)) {
        const image = new Image();
        image.src = cuiImageComponent.png as string;
        image.onload = () => {
          this.preloadedImages.set(cuiImageComponent.png as string, image);
        };
      }
    });
  }

  findShapeAtCoordinates(x: number, y: number): CuiElementModel | null {
    const findShape = (shapePosition: ShapePosition, shape: CuiElementModel): CuiElementModel | null => {

      if(!shape.visible)
        return null;

      const { x: shapeX, y: shapeY, width, height } = shapePosition;

      const withinX = x >= shapeX && x <= shapeX + width;
      const withinY = y >= shapeY && y <= shapeY + height;

      for (const child of shape.children) {
        const foundChild = findShape(
          child.rectTransform().generateShapePositions(),
          shape.children.find((c) => c.id === child.id)!
        );
        if (foundChild) return foundChild;
      }

      if (withinX && withinY) {
          return shape;
      }

      return null;
    };

    for (let i = this.graphicEditorStore.children.length - 1; i >= 0; i--) {
      const shapePosition = this.graphicEditorStore.children[i].rectTransform().generateShapePositions();
      if (!shapePosition) continue;

      const foundShape = findShape(shapePosition, this.graphicEditorStore.children[i]);
      if (foundShape) return foundShape;
    }

    return null;
  }

  findMarkerUnderMouse(x: number, y: number): Marker | null {
    const isClose = (x1: number, y1: number, x2: number, y2: number) => Math.abs(x1 - x2) < 10 && Math.abs(y1 - y2) < 10;

    const findMarker = (shape: CuiElementModel): Marker | null => {
      if(!shape.visible)
        return null;

      const { x: shapeX, y: shapeY, width: shapeWidth, height: shapeHeight, anchor, markers } =
        shape.rectTransform().generateShapePositions();

      if (anchor) {
        const { x: anchorX, y: anchorY, width: anchorWidth, height: anchorHeight } = anchor;

        if (isClose(x, y, anchorX, anchorY))
          return { handle: 'topLeft', isOffset: false, isEdge: false, startX: x, startY: y, element: shape };
        if (isClose(x, y, anchorX + anchorWidth, anchorY))
          return { handle: 'topRight', isOffset: false, isEdge: false, startX: x, startY: y, element: shape };
        if (isClose(x, y, anchorX, anchorY + anchorHeight))
          return { handle: 'bottomLeft', isOffset: false, isEdge: false, startX: x, startY: y, element: shape };
        if (isClose(x, y, anchorX + anchorWidth, anchorY + anchorHeight))
          return { handle: 'bottomRight', isOffset: false, isEdge: false, startX: x, startY: y, element: shape };

        if (isClose(x, y, anchorX + anchorWidth / 2, anchorY))
          return { handle: 'top', isOffset: false, isEdge: true, startX: x, startY: y, element: shape };
        if (isClose(x, y, anchorX + anchorWidth, anchorY + anchorHeight / 2))
          return { handle: 'right', isOffset: false, isEdge: true, startX: x, startY: y, element: shape };
        if (isClose(x, y, anchorX + anchorWidth / 2, anchorY + anchorHeight))
          return { handle: 'bottom', isOffset: false, isEdge: true, startX: x, startY: y, element: shape };
        if (isClose(x, y, anchorX, anchorY + anchorHeight / 2))
          return { handle: 'left', isOffset: false, isEdge: true, startX: x, startY: y, element: shape };
      }

      if (isClose(x, y, shapeX, shapeY))
        return { handle: 'topLeft', isOffset: true, isEdge: false, startX: x, startY: y, element: shape };
      if (isClose(x, y, shapeX + shapeWidth, shapeY))
        return { handle: 'topRight', isOffset: true, isEdge: false, startX: x, startY: y, element: shape };
      if (isClose(x, y, shapeX, shapeY + shapeHeight))
        return { handle: 'bottomLeft', isOffset: true, isEdge: false, startX: x, startY: y, element: shape };
      if (isClose(x, y, shapeX + shapeWidth, shapeY + shapeHeight))
        return { handle: 'bottomRight', isOffset: true, isEdge: false, startX: x, startY: y, element: shape };

      if (isClose(x, y, shapeX + shapeWidth / 2, shapeY))
        return { handle: 'top', isOffset: true, isEdge: true, startX: x, startY: y, element: shape };
      if (isClose(x, y, shapeX + shapeWidth, shapeY + shapeHeight / 2))
        return { handle: 'right', isOffset: true, isEdge: true, startX: x, startY: y, element: shape };
      if (isClose(x, y, shapeX + shapeWidth / 2, shapeY + shapeHeight))
        return { handle: 'bottom', isOffset: true, isEdge: true, startX: x, startY: y, element: shape };
      if (isClose(x, y, shapeX, shapeY + shapeHeight / 2))
        return { handle: 'left', isOffset: true, isEdge: true, startX: x, startY: y, element: shape };

      if (markers) {
        for (const markerType of ['blue', 'red', 'green', 'yellow'] as const) {
          for (const marker of markers[markerType]) {
            if (isClose(x, y, marker.x, marker.y)) {
              // Map color to a generic handle type
              const handleType = this.mapColorToHandle(markerType);
              return { handle: handleType, isOffset: false, isEdge: false, startX: x, startY: y, element: shape };
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

    for (let i = this.graphicEditorStore.children.length - 1; i >= 0; i--) {
      const marker = findMarker(this.graphicEditorStore.children[i]);

      if (marker?.element.selected && marker) return marker;
    }

    return null;
  }

  private mapColorToHandle(color: 'blue' | 'red' | 'green' | 'yellow'): 'topLeft' | 'topRight' | 'bottomLeft' | 'bottomRight' | 'top' | 'right' | 'bottom' | 'left' {
    // Map the color to a handle type, this is an arbitrary mapping for example purposes
    switch (color) {
      case 'blue':
        return 'topLeft';
      case 'red':
        return 'topRight';
      case 'green':
        return 'bottomLeft';
      case 'yellow':
        return 'bottomRight';
      default:
        return 'topLeft'; // Default case
    }
  }

  handleMouseDown(e: {clientX: number, clientY: number}, canvasBounds: DOMRect | undefined) {
    if (!canvasBounds) return;

    const { graphicEditorStore } = this;
    const mouseX = e.clientX - canvasBounds.left;
    const mouseY = e.clientY - canvasBounds.top;
    const shape = this.findShapeAtCoordinates(mouseX, graphicEditorStore.size.height - mouseY);
    const marker = this.findMarkerUnderMouse(mouseX, graphicEditorStore.size.height - mouseY);

    if (marker) {
      this.setResizing(marker);
    } else if (shape) {
      graphicEditorStore.setSelected(shape);
      graphicEditorStore.setDragging({ element: shape, startX: e.clientX, startY: e.clientY });
    } else {
      graphicEditorStore.desetSelected();
    }
  }

  handleMouseMove(
    e: {clientX: number, clientY: number},
    canvasBounds: DOMRect | undefined
  ) {
    const { graphicEditorStore, resizing } = this;
    if (!graphicEditorStore.selectedItem || !canvasBounds) return;

    if (resizing) {
      if(!resizing.element.visible) return;

      const currentX = e.clientX - canvasBounds.left;
      const currentY = graphicEditorStore.size.height - (e.clientY - canvasBounds.top);

      const rectTransform = resizing.element.findComponentByType(CuiRectTransformModel);
      if (!rectTransform) return;

      if(resizing.isOffset && this.graphicEditorStore.disableOffset) return;
      else if(!resizing.isOffset && this.graphicEditorStore.disableAnchor) return;

      rectTransform.resize(resizing.handle, resizing.isOffset, resizing.isEdge, currentX, currentY);
    } else if (graphicEditorStore.draggingItem) {
      if(!graphicEditorStore.draggingItem.element.visible) return;

      const rectTransform = graphicEditorStore.draggingItem.element.findComponentByType(CuiRectTransformModel);
      if (!rectTransform) return;

      const dx = e.clientX - graphicEditorStore.draggingItem.startX;
      const dy = graphicEditorStore.draggingItem.startY - e.clientY;

      rectTransform.updatePosition(dx, dy);

      graphicEditorStore.setDragging({
        element: graphicEditorStore.draggingItem.element,
        startX: e.clientX,
        startY: e.clientY,
      });
    }
  }

  handleMouseUp() {
    this.graphicEditorStore.desetDragging();
    this.setResizing(null);
  }
}

export default EditorCanvasStore;
