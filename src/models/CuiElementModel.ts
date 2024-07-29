import ICuiComponent from "./ICuiComponent";
import CuiRectTransformModel, { Size, TransformValues } from "./CuiRectTransformModel";
import TreeNodeModel, { Rect } from "./TreeNodeModel";
import { action, makeObservable, observable } from "mobx";
import GraphicEditor from "../components/Editor/GraphicEditor";
import GraphicEditorStore from "../components/Editor/GraphicEditorStore";
import ICuiImageComponent from "./ICuiImageComponent";


export interface Marker {
  handle: 'topLeft' | 'topRight' | 'bottomLeft' | 'bottomRight' | 'top' | 'right' | 'bottom' | 'left';
  isOffset: boolean;
  isEdge: boolean;
  startX: number;
  startY: number;
  element: CuiElementModel;
}

export default class CuiElementModel extends TreeNodeModel {

  constructor(
    public type: 'CuiButton' | 'CuiPanel' | 'CuiLabel' | 'CuiElement',
    public visible: boolean = true,
    children: CuiElementModel[] = [],
    public components: ICuiComponent[] = [],
    public collapsed: boolean = false,
    public selected: boolean = false,
    public dragging: boolean = false,
    parent?: TreeNodeModel, // добавлен аргумент parent
  ) {
    super(children, parent); // Add the super() call here
    this.addComponent(new CuiRectTransformModel("0.1 0.1", "0.2 0.2", "10 10", "-10 -10", this));
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

  //instance: new (...args: any[]) => T
  findComponentByType<T extends ICuiComponent>(componentClass: new (...args: any[]) => T): T | undefined {
    return this.components.find(
      (component): component is T => component instanceof componentClass
    ) as T | undefined;
  }

  findComponentByTypes<T extends ICuiComponent>(componentClasses: Array<new (...args: any[]) => T>): T | undefined {
    for (const componentClass of componentClasses) {
      const foundComponent = this.components.find(
        (component): component is T => component instanceof componentClass
      );
      if (foundComponent) {
        return foundComponent;
      }
    }
    return undefined;
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

${this.children?.map(s => s?.ToCode()).join('\n')}
`;
}

  addComponent<T extends ICuiComponent>(componentClass : T): CuiElementModel {
  
    this.components.push(componentClass); 
  
    return this;
  }
}