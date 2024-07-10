import { CuiElement, ICuiComponent } from "@/models/types";

export const toInvertedY = (y: number, height: number): number => {
    return height - y;
};
  
  // Преобразование координаты `y` из системы координат Unity обратно в систему координат браузера
export const fromInvertedY = (invertedY: number, height: number): number => {
    return height - invertedY;
};


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
  updatedValues: Partial<T>
): CuiElement => {
  const component = findComponentByType<T>(element);

  if(component == null)
    return element;

  const updatedComponent = { ...component, ...updatedValues };
  const updatedComponents = element.components.map(c => 
    c.type === component.type ? updatedComponent : c
  );
  
  return { ...element, components: updatedComponents };
};