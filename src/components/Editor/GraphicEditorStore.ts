import { makeObservable, observable, action } from "mobx";
import CuiElementModel from "../../models/CuiElementModel";
import TreeNodeModel, { Rect } from "../../models/TreeNodeModel";
import { Size } from "@/models/CuiRectTransformModel";

export interface DragingModel {
  element: CuiElementModel;
  startX: number;
  startY: number;
}

export default class GraphicEditorStore extends TreeNodeModel {

  public draggingItem: DragingModel | null = null;
  public selectedItem: CuiElementModel | null = null;

  constructor(public size: Size, children: CuiElementModel[], parent?: TreeNodeModel) {
    super(children, parent);
    makeObservable(this, {
      size: observable,
      draggingItem: observable,
      selectedItem: observable,
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
}
