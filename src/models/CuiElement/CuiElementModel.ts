import CuiComponentBase from "../CuiComponent/CuiComponentBase";
import CuiRectTransformModel, { Size, TransformValues } from "../CuiComponent/CuiRectTransformModel";
import TreeNodeModel, { Rect } from "./TreeNodeModel";
import { action, makeObservable, observable } from "mobx";
import GraphicEditor from "../../components/Editor/GraphicEditor";
import GraphicEditorStore from "../../components/Editor/GraphicEditorStore";
import ICuiImageComponent from "../CuiComponent/ICuiImageComponent";
import CuiElementParceModel from "../Parce/CuiElementParceModel";


export interface Marker {
  handle: 'topLeft' | 'topRight' | 'bottomLeft' | 'bottomRight' | 'top' | 'right' | 'bottom' | 'left';
  isOffset: boolean;
  isEdge: boolean;
  startX: number;
  startY: number;
  element: CuiElementModel;
}

export default class CuiElementModel extends TreeNodeModel {

  public collapsed: boolean = false;
  public selected: boolean = false;
  public dragging: boolean = false;
  public visible: boolean = true;
  public components: CuiComponentBase[] = [];

  constructor(
    public type: 'CuiButton' | 'CuiPanel' | 'CuiLabel' | 'CuiElement',
    children: CuiElementModel[] = [],
    id?: number,
    parent?: TreeNodeModel, // добавлен аргумент parent
  ) {
    super(children, parent, id); // Add the super() call here

    const cuiTransform = new CuiRectTransformModel(this);
    cuiTransform.anchorMin = "0.1 0.1";
    cuiTransform.anchorMax = "0.2 0.2";
    cuiTransform.offsetMin = "10 10";
    cuiTransform.offsetMax = "-10 -10";

    this.addComponent(cuiTransform);

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
  findComponentByType<T extends CuiComponentBase>(componentClass: new (...args: any[]) => T): T | undefined {
    return this.components.find(
      (component): component is T => component instanceof componentClass
    ) as T | undefined;
  }

  findComponentByTypeText<T extends CuiComponentBase>(type: string): T | undefined {
    return this.components.find(
      component => component.type === type
    ) as T | undefined;
  }

  findComponentByTypes<T extends CuiComponentBase>(componentClasses: Array<new (...args: any[]) => T>): T | undefined {
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

  updateComponent<T extends CuiComponentBase>(componentClass: new (...args: any[]) => T, updatedValues: Partial<T>): CuiElementModel {
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

  updateComponentText(type: string, updatedValues: Partial<CuiComponentBase>): CuiElementModel {
    const component = this.findComponentByTypeText<CuiComponentBase>(type);
    if (component == null) {
        return this;
    }

    // Извлекаем только нужные поля из updatedValues
    const { element, ...filteredValues } = updatedValues;

    // Обновляем только необходимые свойства в существующем компоненте
    Object.assign(component, filteredValues);

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

  addComponent<T extends CuiComponentBase>(componentClass : T): CuiElementModel {
  
    this.components.push(componentClass); 
  
    return this;
  }

// toJSON(): string {
//     // Разбор строки JSON из super.toJSON() обратно в объект
//     const parentJson = JSON.parse(super.toJSON());

//     return JSON.stringify({
//       ...parentJson, // Применение оператора распространения к объекту
//       type: this.type,
//       visible: this.visible,
//       components: this.components.map(component => JSON.parse(component.toJSON())), // Предполагается, что CuiComponentBase имеет метод toJSON
//       collapsed: this.collapsed,
//       selected: this.selected,
//       dragging: this.dragging,
//     });
//   }

  toRustFormat(): CuiElementParceModel[] {

    const array: CuiElementParceModel[] = [];

    const currentElement : CuiElementParceModel =  {
      type: this.type,
      parent: this.parent instanceof GraphicEditorStore ? "Overlay" : this.parent?.id?.toString() || "",
      name: this.id.toString(),
      components: this.components
    };

    array.push(currentElement);

    this.children.forEach(child => {
      array.push(...child.toRustFormat());
    });
    
    return array;
  }
}