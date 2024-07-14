import ICuiComponent from "./ICuiComponent";

export default class CuiElement {
  
  constructor(
    public id: number,
    public type: 'rect' | 'circle',
    public visible: boolean,
    public children: CuiElement[],
    public components: ICuiComponent[],
    public collapsed: boolean,
    public parent: CuiElement | null = null // добавлен аргумент parent
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

    updateComponent<T extends ICuiComponent>(updatedValues: Partial<T>): CuiElement {
      const component = this.findComponentByType<T>();
    
      if (component == null) {
        return this;
      }
    
      const updatedComponent = new (component.constructor as { new (): T })();
      Object.assign(updatedComponent, component, updatedValues);
    
      const updatedComponents = this.components.map(c => 
        c.type === component.type ? updatedComponent : c
      );
    
      return new CuiElement(
        this.id,
        this.type,
        this.visible,
        this.children,
        updatedComponents,
        this.collapsed,
        this.parent,
      );
    }
}
