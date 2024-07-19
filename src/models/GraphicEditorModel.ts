import CuiElementModel from "./CuiElementModel";
import CuiRectTransformModel, { Size } from "./CuiRectTransformModel";
import TreeNodeModel, { Rect } from "./TreeNodeModel";

export default class GraphicEditorModel extends TreeNodeModel {

  constructor(private size: Size, children: CuiElementModel[], parent?: TreeNodeModel) { super(children, parent); }

  public getSize(): Size {
    return this.size;
  }

  public setSize(size: Size): void {    
    this.size = size;
  }

  calculatePositionAndSize(): Rect {
    return { x: 0, y: 0, width: this.size.width, height: this.size.height };
  }

  calculateParentPositionAndSize(): Rect {
    return { x: 0, y: 0, width: 0, height: 0};
  }

  // pushNewElement = (type: 'rect' | 'circle'): CuiElementModel => {
  //   // const element = new CuiElementModel(
  //   //   type,
  //   //   true,
  //   //   [],
  //   //   [],
  //   //   false,
  //   //   false,
  //   //   this
  //   // );
  
  //   // element.addComponent(new CuiRectTransformModel("0.1 0.1", "0.2 0.2", "10 10", "-10 -10", element));
  //   // this.pushChild(element);
  //   return new CuiElementModel( type, true, [], [], false, false, this );
  // };
}
