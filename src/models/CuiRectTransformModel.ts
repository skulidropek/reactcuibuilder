import { fromInvertedY } from "../utils/coordinateUtils";
import ICuiComponent from "./ICuiComponent";

export interface TransformValues {
  anchorMin: { x: number; y: number };
  anchorMax: { x: number; y: number };
  offsetMin: { x: number; y: number };
  offsetMax: { x: number; y: number };
}

export default class CuiRectTransformModel implements ICuiComponent {
    type: string = 'RectTransform';
    anchorMin: string;
    anchorMax: string;
    offsetMin: string;
    offsetMax: string;
  
    constructor(
      anchorMin: string,
      anchorMax: string,
      offsetMin: string,
      offsetMax: string
    ) {
      this.anchorMin = anchorMin;
      this.anchorMax = anchorMax;
      this.offsetMin = offsetMin;
      this.offsetMax = offsetMax;
    }
  
    extractTransformValues(): TransformValues {
      const [anchorMinX, anchorMinY] = this.anchorMin.split(' ').map(Number);
      const [anchorMaxX, anchorMaxY] = this.anchorMax.split(' ').map(Number);
      const [offsetMinX, offsetMinY] = this.offsetMin.split(' ').map(Number);
      const [offsetMaxX, offsetMaxY] = this.offsetMax.split(' ').map(Number);
  
      return {
        anchorMin: { x: anchorMinX, y: anchorMinY },
        anchorMax: { x: anchorMaxX, y: anchorMaxY },
        offsetMin: { x: offsetMinX, y: offsetMinY },
        offsetMax: { x: offsetMaxX, y: offsetMaxY },
      };
    }
  
    calculatePositionAndSize(parentSize: { width: number; height: number }, invertedY: boolean = false): { x: number, y: number, width: number, height: number } {
      const { anchorMin, anchorMax, offsetMin, offsetMax } = this.extractTransformValues();
  
      const x = anchorMin.x * parentSize.width + offsetMin.x;
      const y = invertedY 
        ? fromInvertedY(anchorMax.y * parentSize.height + offsetMin.y, parentSize.height) 
        : anchorMax.y * parentSize.height + offsetMin.y;
      const width = (anchorMax.x - anchorMin.x) * parentSize.width + (offsetMax.x - offsetMin.x);
      const height = (anchorMax.y - anchorMin.y) * parentSize.height + (offsetMax.y - offsetMin.y);
  
      return { x, y, width, height };
    }
  
    updatePosition(dx: number, dy: number, editorSize: { width: number; height: number }) {
      const { anchorMin, anchorMax } = this.extractTransformValues();
  
      const newAnchorMin = {
        x: ((anchorMin.x * editorSize.width + dx) / editorSize.width).toFixed(3),
        y: ((anchorMin.y * editorSize.height + dy) / editorSize.height).toFixed(3)
      };
      const newAnchorMax = {
        x: ((anchorMax.x * editorSize.width + dx) / editorSize.width).toFixed(3),
        y: ((anchorMax.y * editorSize.height + dy) / editorSize.height).toFixed(3)
      };
  
      this.anchorMin = `${newAnchorMin.x} ${newAnchorMin.y}`;
      this.anchorMax = `${newAnchorMax.x} ${newAnchorMax.y}`;
    }
}