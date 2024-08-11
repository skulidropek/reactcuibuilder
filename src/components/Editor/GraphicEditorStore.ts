import { makeObservable, observable, action } from "mobx";
import CuiElementModel from "../../models/CuiElement/CuiElementModel";
import TreeNodeModel, { Rect } from "../../models/CuiElement/TreeNodeModel";
import { Size } from "@/models/CuiComponent/CuiRectTransformModel";
import CuiElementParceModel from "@/models/Parce/CuiElementParceModel";

export interface DragingModel {
  element: CuiElementModel;
  startX: number;
  startY: number;
}

export default class GraphicEditorStore extends TreeNodeModel {
  toRustFormat(): CuiElementParceModel[] {
    const array: CuiElementParceModel[] = [];

    this.children.forEach(child => {
      array.push(...child.toRustFormat());
    });
    
    return array;
  }

  public disableAnchor: boolean = false;
  public disableOffset: boolean = false;

  public draggingItem: DragingModel | null = null;
  public selectedItem: CuiElementModel | null = null;

  constructor(public size: Size, children: CuiElementModel[], parent?: TreeNodeModel) {
    super(children, parent);
    makeObservable(this, {
      size: observable,
      draggingItem: observable,
      selectedItem: observable,
      disableAnchor: observable,
      disableOffset: observable,
    });
  }

  calculatePositionAndSize(): Rect {
    return { x: 0, y: 0, width: this.size.width, height: this.size.height };
  }

  calculateParentPositionAndSize(): Rect {
    return { x: 0, y: 0, width: 0, height: 0 };
  }

  setSelected = (element: CuiElementModel | null) => {
    this.forEach(el => {
      if (el instanceof CuiElementModel) {
        el.selected = false;
      }
    });
  
    if (element) {
      element.selected = true;
    }

    this.selectedItem = element;
  };

  setDragging = (dragging: DragingModel | null) => {
    this.forEach(el => {
      if (el instanceof CuiElementModel) {
        el.dragging = false;
      }
    });
  
    if (dragging?.element) {
      dragging.element.dragging = true;
    }

    this.draggingItem = dragging;
  };

  
  desetDragging = () => {
    this.forEach(el => {
      if (el instanceof CuiElementModel) {
        el.dragging = false;
      }
    });

    this.draggingItem = null;
  };

  desetSelected = () => {
    this.forEach(el => {
      if (el instanceof CuiElementModel) {
        el.selected = false;
      }
    });

    this.selectedItem = null;
  };

  toJSON(): string {
    return JSON.stringify(this.children.map(child => JSON.parse(child.toJSON())));
  }
}
