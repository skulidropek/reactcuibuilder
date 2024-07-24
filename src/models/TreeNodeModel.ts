import { makeObservable, observable, action } from "mobx";
import CuiElementModel from "./CuiElementModel";
import CuiRectTransformModel, { Size } from "../models/CuiRectTransformModel";
import CuiImageComponentModel from "../models/CuiImageComponentModel";

export class Rect {
  constructor(
    public x: number,
    public y: number,
    public width: number,
    public height: number
  ) {}
}

export default abstract class TreeNodeModel {
  readonly id: number = Date.now();
  private _parent?: TreeNodeModel;
  readonly children: CuiElementModel[];

  constructor(children: CuiElementModel[], parent?: TreeNodeModel) {
    this.children = children;
    this._parent = parent;
    makeObservable(this, {
      children: observable,
      pushChild: action,
    });
  }

  get parent(): TreeNodeModel | undefined {
    return this._parent;
  }

  pushChild(element: CuiElementModel) {
    element._parent?.deleteChild(element);
    element._parent = this;
    this.children.push(element);
  }
  
  pushNewElement = (type: 'rect' | 'circle' = 'rect'): CuiElementModel => {
    const element = new CuiElementModel(
      type,
      undefined,  // visible
      undefined,  // children
      undefined,  // components
      undefined,  // collapsed
      undefined,  // selected
      undefined,  // dragging
      this        // parent
    );
  
    element.addComponent(new CuiRectTransformModel("0.1 0.1", "0.2 0.2", "10 10", "-10 -10", element));
    element.addComponent(new CuiImageComponentModel(element, undefined, undefined, '1', undefined, undefined, undefined, undefined, undefined));
    this.pushChild(element);
    return element;
  };

  private deleteChild(element: CuiElementModel) {
    const index = this.children.indexOf(element);
    if (index !== -1) {
      element._parent = undefined;
      this.children.splice(index, 1);
    }
  }

  getParentOrChildById(id: number): CuiElementModel | null { // Заменить на TreeNodeModel
    if (this instanceof CuiElementModel && this.id === id) {
      return this;
    }

    for (const child of this.children) {
      if (child.id === id) {
        return child;
      } else if (child instanceof TreeNodeModel) {
        const result = child.getParentOrChildById(id);
        if (result) {
          return result;
        }
      }
    }

    return null;
  }

  forEach(callback: (element: TreeNodeModel) => void): void {
    this.children.forEach(child => child.forEach(callback));
    callback(this);
  }

  abstract calculateParentPositionAndSize(): Rect;
  abstract calculatePositionAndSize(): Rect;
}
