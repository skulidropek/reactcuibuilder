import { makeObservable, observable, action } from "mobx";
import CuiElementModel from "../../models/CuiElementModel";
import CuiRectTransformModel, { Size } from "../../models/CuiRectTransformModel";
import TreeNodeModel, { Rect } from "../../models/TreeNodeModel";

export default class GraphicEditorStore extends TreeNodeModel {

  public draggingItem: CuiElementModel | null = null;
  public selectedItem: CuiElementModel | null = null;

  constructor(public size: Size, children: CuiElementModel[], parent?: TreeNodeModel) {
    super(children, parent);
    makeObservable(this, {
      size: observable,
      pushNewElement: action,
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

  pushNewElement = (type: 'rect' | 'circle'): CuiElementModel => {
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
    this.pushChild(element);
    return element;
  };

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

  desetSelected = () => {
    this.forEach(el => {
      if (el instanceof CuiElementModel) {
        el.selected = false;
      }
    });

    this.selectedItem = null;
  };
}
