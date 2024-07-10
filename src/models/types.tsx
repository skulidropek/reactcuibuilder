export interface CuiElement {
  id: number;
  type: 'rect' | 'circle';
  visible: boolean;
  children: CuiElement[];
  components: ICuiComponent[];
  collapsed: boolean;
}

export interface ICuiComponent {
  type: string;
}

export interface CuiRectTransformModel extends ICuiComponent {
  type: 'RectTransform';
  anchorMin: string;
  anchorMax: string;
  offsetMin: string;
  offsetMax: string;
}

export const findComponentByType = <T extends ICuiComponent>(
  element: CuiElement
): T | undefined => {
  // Здесь мы используем утверждение типа (type assertion),
  // так как TypeScript не может вывести конкретный тип во время выполнения
  return element.components.find(
    (component): component is T => true
  ) as T | undefined;
}

export const updateComponent = <T extends ICuiComponent>(
  element: CuiElement,
  componentType: T['type'],
  updatedValues: Partial<T>
): CuiElement => {
  const updatedComponents = element.components.map(component => {
    if (component.type === componentType) {
      return { ...component, ...updatedValues } as T;
    }
    return component;
  });

  if (JSON.stringify(element.components) !== JSON.stringify(updatedComponents)) {
    return { ...element, components: updatedComponents };
  }

  return element;
};