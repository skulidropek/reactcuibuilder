import ICuiComponent from "./ICuiComponent";

export default class CuiElement {
    id: number;
    type: 'rect' | 'circle';
    visible: boolean;
    children: CuiElement[];
    components: ICuiComponent[];
    collapsed: boolean;
  
    constructor(
      id: number,
      type: 'rect' | 'circle',
      visible: boolean,
      children: CuiElement[],
      components: ICuiComponent[],
      collapsed: boolean
    ) {
      this.id = id;
      this.type = type;
      this.visible = visible;
      this.children = children;
      this.components = components;
      this.collapsed = collapsed;
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
        this.collapsed
      );
    }
  }