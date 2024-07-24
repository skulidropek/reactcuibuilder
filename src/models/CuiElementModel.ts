import ICuiComponent from "./ICuiComponent";
import CuiRectTransformModel, { Size, TransformValues } from "./CuiRectTransformModel";
import TreeNodeModel, { Rect } from "./TreeNodeModel";
import { action, makeObservable, observable } from "mobx";
import GraphicEditor from "../components/Editor/GraphicEditor";
import GraphicEditorStore from "../components/Editor/GraphicEditorStore";


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

export default class CuiElementModel extends TreeNodeModel {

  constructor(
    public type: 'rect' | 'circle',
    public visible: boolean = true,
    children: CuiElementModel[] = [],
    public components: ICuiComponent[] = [],
    public collapsed: boolean = false,
    public selected: boolean = false,
    public dragging: boolean = false,
    parent?: TreeNodeModel, // добавлен аргумент parent
  ) {
    super(children, parent); // Add the super() call here
    makeObservable(this, {
      visible: observable,
      components: observable,
      collapsed: observable,
      selected: observable,
      dragging: observable,
      updateComponent: action,
    });
  }

  public rectTransform(): CuiRectTransformModel {
    return this.findComponentByType(CuiRectTransformModel)!;
  }

  calculateParentPositionAndSize(): Rect {
    return this.parent?.calculatePositionAndSize()!;
  }

  calculatePositionAndSize(): Rect {
    return this.rectTransform().calculatePositionAndSize();
  }

  public updateProperty<K extends keyof this>(key: K, value: this[K]): void {
    (this as any)[key] = value;
  }
  findComponentByType<T extends ICuiComponent>(componentClass: new (...args: any[]) => T): T | undefined {
    return this.components.find(
      (component): component is T => component instanceof componentClass
    ) as T | undefined;
  }

  updateComponent<T extends ICuiComponent>(componentClass: new (...args: any[]) => T, updatedValues: Partial<T>): CuiElementModel {
    const component = this.findComponentByType(componentClass);
    if (component == null) {
      return this;
    }
  
    const updatedComponent = new (component.constructor as { new (): T })();
    Object.assign(updatedComponent, component, updatedValues);
  
    this.components = this.components.map(c =>
      c.type === component.type ? updatedComponent : c
    );
  


    return this;
  }

  ToCode(): string {
    return `container.Add(new CuiElement
{
Name = "${this.id}",
Parent = "${this?.parent instanceof GraphicEditorStore ? "Overlay" : this.parent?.id}",
Components = {
  ${this.components.map(c => c.ToCode()).join(',\n')}
}
});

${this.children?.map(s => s?.ToCode()).join(',\n')}
`;
}

  addComponent<T extends ICuiComponent>(componentClass : T): CuiElementModel {
  
    this.components.push(componentClass); 
  
    return this;
  }

  // parentSize: Size, offsetX: number = 0, offsetY: number = 0
  generateShapePositions(): ShapePosition | null {

    const rectTransform = this.rectTransform();
    if (!rectTransform) return null;

    const parrentSize = this.calculateParentPositionAndSize();

    const { x, y, width, height } = rectTransform.calculatePositionAndSize();
    
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
      const anchorX = transformValues.anchorMin.x * parrentSize.width + parrentSize.x;
      const anchorY = transformValues.anchorMin.y * parrentSize.height + parrentSize.y;
      const anchorWidth = (transformValues.anchorMax.x - transformValues.anchorMin.x) * parrentSize.width;
      const anchorHeight = (transformValues.anchorMax.y - transformValues.anchorMin.y) * parrentSize.height;

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
      const childData = child.generateShapePositions();
      if (childData) {
        shapeData.children.push(childData);
      }
    });

    return shapeData;
  }
}