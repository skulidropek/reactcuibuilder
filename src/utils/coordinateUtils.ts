// import { CuiElement, ICuiComponent } from "@/models/types";
import CuiElement from "@/models/CuiElement";
import ICuiComponent from "@/models/ICuiComponent";

export const toInvertedY = (y: number, height: number): number => {
    return height - y;
};
  
  // Преобразование координаты `y` из системы координат Unity обратно в систему координат браузера
export const fromInvertedY = (invertedY: number, height: number): number => {
    return height - invertedY;
};