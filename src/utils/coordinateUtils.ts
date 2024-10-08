// import { CuiElementModel, CuiComponentBase } from "@/models/types";
import CuiElementModel from "@/models/CuiElement/CuiElementModel";
import CuiComponentBase from "@/models/CuiComponent/CuiComponentBase";

export const toInvertedY = (y: number, height: number): number => {
    return height - y;
};
  
  // Преобразование координаты `y` из системы координат Unity обратно в систему координат браузера
export const fromInvertedY = (invertedY: number, height: number): number => {
    return height - invertedY;
};