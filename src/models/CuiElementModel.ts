import ICuiComponent from "./ICuiComponent";
import CuiRectTransformModel, { Size, TransformValues } from "./CuiRectTransformModel";


export interface Marker {
  handle: 'topLeft' | 'topRight' | 'bottomLeft' | 'bottomRight' | 'top' | 'right' | 'bottom' | 'left';
  isOffset: boolean;
  isEdge: boolean;
  startX: number;
  startY: number;
  element: CuiElementModel;
}

export interface ShapePosition {
  id: number;
  type: string;
  x: number;
  y: number;
  width: number;
  height: number;
  children: ShapePosition[];
  selected: boolean;
  anchor?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  markers?: {
    blue: { x: number; y: number }[];
    red: { x: number; y: number }[];
    green: { x: number; y: number }[];
    yellow: { x: number; y: number }[];
  };
  element: CuiElementModel; // добавляем это свойство
}

export default class CuiElementModel {
  constructor(
    public id: number,
    public type: 'rect' | 'circle',
    public visible: boolean,
    public children: CuiElementModel[],
    public components: ICuiComponent[],
    public collapsed: boolean,
    public parent: CuiElementModel | null = null, // добавлен аргумент parent
    public selected: boolean
  ) {
    this.setParentForChildren();
  }

  setParentForChildren() {
    this.children.forEach(child => {
      child.parent = this;
      child.setParentForChildren(); // рекурсивно устанавливаем родителей для всех потомков
    });
  }

  findComponentByType<T extends ICuiComponent>(): T | undefined {
    return this.components.find(
      (component): component is T => true
    ) as T | undefined;
  }

  updateComponent<T extends ICuiComponent>(updatedValues: Partial<T>): CuiElementModel {
    const component = this.findComponentByType<T>();

    if (component == null) {
      return this;
    }

    const updatedComponent = new (component.constructor as { new (): T })();
    Object.assign(updatedComponent, component, updatedValues);

    const updatedComponents = this.components.map(c =>
      c.type === component.type ? updatedComponent : c
    );

    return new CuiElementModel(
      this.id,
      this.type,
      this.visible,
      this.children,  
      updatedComponents,
      this.collapsed,
      this.parent,
      this.selected
    );
  }

  generateShapePositions(parentSize: Size, offsetX: number = 0, offsetY: number = 0): ShapePosition | null {
    const rectTransform = this.findComponentByType<CuiRectTransformModel>();
    if (!rectTransform) return null;

    const { x, y, width, height } = rectTransform.calculatePositionAndSize(parentSize, offsetX, offsetY);

    const shapeData: ShapePosition = {
      id: this.id,
      type: this.type,
      x,
      y,
      width,
      height,
      children: [],
      selected: this.selected,
      element: this
    };

    if (this.selected) {
      const transformValues = rectTransform.extractTransformValues();
      const anchorX = transformValues.anchorMin.x * parentSize.width + offsetX;
      const anchorY = transformValues.anchorMin.y * parentSize.height + offsetY;
      const anchorWidth = (transformValues.anchorMax.x - transformValues.anchorMin.x) * parentSize.width;
      const anchorHeight = (transformValues.anchorMax.y - transformValues.anchorMin.y) * parentSize.height;

      shapeData.anchor = {
        x: anchorX,
        y: anchorY,
        width: anchorWidth,
        height: anchorHeight,
      };
      shapeData.markers = {
        blue: [
          { x: anchorX, y: anchorY },
          { x: anchorX + anchorWidth, y: anchorY },
          { x: anchorX, y: anchorY + anchorHeight },
          { x: anchorX + anchorWidth, y: anchorY + anchorHeight }
        ],
        red: [
          { x, y },
          { x: x + width, y },
          { x, y: y + height },
          { x: x + width, y: y + height }
        ],
        green: [
          { x: anchorX + anchorWidth / 2, y: anchorY },
          { x: anchorX + anchorWidth, y: anchorY + anchorHeight / 2 },
          { x: anchorX + anchorWidth / 2, y: anchorY + anchorHeight },
          { x: anchorX, y: anchorY + anchorHeight / 2 }
        ],
        yellow: [
          { x: x + width / 2, y },
          { x: x + width, y: y + height / 2 },
          { x: x + width / 2, y: y + height },
          { x, y: y + height / 2 }
        ]
      };
    }

    this.children.forEach((child: CuiElementModel) => {
      const childData = child.generateShapePositions({ width, height }, x, y);
      if (childData) {
        shapeData.children.push(childData);
      }
    });

    return shapeData;
  }
}