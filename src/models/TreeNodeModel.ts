import CuiElementModel from "./CuiElementModel";

export class Rect {
  constructor(
    public x: number,
    public y: number,
    public width: number,
    public height: number
  ) {}
}

type Subscriber = () => void;

export default abstract class TreeNodeModel {
  private subscribers: Subscriber[] = [];
  readonly id: number = Date.now();
  private _parent?: TreeNodeModel;

  constructor(readonly children: CuiElementModel[], parent?: TreeNodeModel) {
    this._parent = parent;
  }

  get parent(): TreeNodeModel | undefined {
    return this._parent;
  }

  set parent(newParent: TreeNodeModel | undefined) {
    if (this._parent !== newParent) {
      this._parent = newParent;
      this.notifySubscribers();
    }
  }

  pushChild(element: CuiElementModel) {
    this.children.push(element);
    this.notifySubscribers();
  }

  deleteChild(element: CuiElementModel) {
    const index = this.children.indexOf(element);
    if (index !== -1) {
      this.children.splice(index, 1);
      this.notifySubscribers();
    }
  }

  getParentOrChildById(id: number): CuiElementModel | null {
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

  public subscribe(callback: Subscriber): void {
    this.subscribers.push(callback);
  }

  public unsubscribe(callback: Subscriber): void {
    this.subscribers = this.subscribers.filter(sub => sub !== callback);
  }

  public notifySubscribers(): void {
    this.subscribers.forEach(sub => sub());
  }

  abstract calculateParentPositionAndSize(): Rect;
  abstract calculatePositionAndSize(): Rect;
}
