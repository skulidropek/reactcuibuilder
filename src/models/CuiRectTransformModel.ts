import ICuiComponent from "./ICuiComponent";

export interface TransformValues {
  anchorMin: { x: number; y: number };
  anchorMax: { x: number; y: number };
  offsetMin: { x: number; y: number };
  offsetMax: { x: number; y: number };
}

export interface Size {
  width: number;
  height: number;
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

  calculatePositionAndSize(parentSize: Size, offsetX: number = 0, offsetY: number = 0): { x: number; y: number; width: number; height: number } {
    const { anchorMin, anchorMax, offsetMin, offsetMax } = this.extractTransformValues();
    
    const x = anchorMin.x * parentSize.width + offsetMin.x + offsetX;
    const y = anchorMin.y * parentSize.height + offsetMin.y + offsetX;
    
    const width = (anchorMax.x - anchorMin.x) * parentSize.width + (offsetMax.x - offsetMin.x);
    const height = (anchorMax.y - anchorMin.y) * parentSize.height + (offsetMax.y - offsetMin.y);
  
    return { x, y, width, height };
  }

  resize(handle: string, isOffset: boolean, isEdge: boolean, currentX: number, currentY: number, parentSize: Size) {
    const transformValues = this.extractTransformValues();
    if (isEdge) {
      if (isOffset) {
        switch (handle) {
          case 'top':
            this.offsetMin = `${transformValues.offsetMin.x} ${currentY - transformValues.anchorMin.y * parentSize.height}`;
            break;
          case 'right':
            this.offsetMax = `${currentX - transformValues.anchorMax.x * parentSize.width} ${transformValues.offsetMax.y}`;
            break;
          case 'bottom':
            this.offsetMax = `${transformValues.offsetMax.x} ${currentY - transformValues.anchorMax.y * parentSize.height}`;
            break;
          case 'left':
            this.offsetMin = `${currentX - transformValues.anchorMin.x * parentSize.width} ${transformValues.offsetMin.y}`;
            break;
        }
      } else {
        const currentXRel = currentX / parentSize.width;
        const currentYRel = currentY / parentSize.height;
        switch (handle) {
          case 'top':
            this.anchorMin = `${transformValues.anchorMin.x} ${Math.max(0, Math.min(currentYRel, transformValues.anchorMax.y - 0.01))}`;
            break;
          case 'right':
            this.anchorMax = `${Math.min(1, Math.max(currentXRel, transformValues.anchorMin.x + 0.01))} ${transformValues.anchorMax.y}`;
            break;
          case 'bottom':
            this.anchorMax = `${transformValues.anchorMax.x} ${Math.min(1, Math.max(currentYRel, transformValues.anchorMin.y + 0.01))}`;
            break;
          case 'left':
            this.anchorMin = `${Math.max(0, Math.min(currentXRel, transformValues.anchorMax.x - 0.01))} ${transformValues.anchorMin.y}`;
            break;
        }
      }
    } else if (isOffset) {
      const anchorMinX = transformValues.anchorMin.x * parentSize.width;
      const anchorMinY = transformValues.anchorMin.y * parentSize.height;
      const anchorMaxX = transformValues.anchorMax.x * parentSize.width;
      const anchorMaxY = transformValues.anchorMax.y * parentSize.height;

      switch (handle) {
        case 'topLeft':
          this.offsetMin = `${currentX - anchorMinX} ${currentY - anchorMinY}`;
          break;
        case 'topRight':
          this.offsetMax = `${currentX - anchorMaxX} ${transformValues.offsetMax.y}`;
          this.offsetMin = `${transformValues.offsetMin.x} ${currentY - anchorMinY}`;
          break;
        case 'bottomLeft':
          this.offsetMin = `${currentX - anchorMinX} ${transformValues.offsetMin.y}`;
          this.offsetMax = `${transformValues.offsetMax.x} ${currentY - anchorMaxY}`;
          break;
        case 'bottomRight':
          this.offsetMax = `${currentX - anchorMaxX} ${currentY - anchorMaxY}`;
          break;
      }
    } else {
      const currentXRel = currentX / parentSize.width;
      const currentYRel = currentY / parentSize.height;

      switch (handle) {
        case 'topLeft':
          this.anchorMin = `${Math.max(0, Math.min(currentXRel, transformValues.anchorMax.x - 0.01))} ${Math.max(0, Math.min(currentYRel, transformValues.anchorMax.y - 0.01))}`;
          break;
        case 'topRight':
          this.anchorMax = `${Math.min(1, Math.max(currentXRel, transformValues.anchorMin.x + 0.01))} ${transformValues.anchorMax.y}`;
          this.anchorMin = `${transformValues.anchorMin.x} ${Math.max(0, Math.min(currentYRel, transformValues.anchorMax.y - 0.01))}`;
          break;
        case 'bottomLeft':
          this.anchorMin = `${Math.max(0, Math.min(currentXRel, transformValues.anchorMax.x - 0.01))} ${transformValues.anchorMin.y}`;
          this.anchorMax = `${transformValues.anchorMax.x} ${Math.min(1, Math.max(currentYRel, transformValues.anchorMin.y + 0.01))}`;
          break;
        case 'bottomRight':
          this.anchorMax = `${Math.min(1, Math.max(currentXRel, transformValues.anchorMin.x + 0.01))} ${Math.min(1, Math.max(currentYRel, transformValues.anchorMin.y + 0.01))}`;
          break;
      }
    }
  }

  updatePosition(dx: number, dy: number, parentSize: Size) {
    const transformValues = this.extractTransformValues();
    const offsetMinX = transformValues.offsetMin.x + dx;
    const offsetMinY = transformValues.offsetMin.y + dy;
    const offsetMaxX = transformValues.offsetMax.x + dx;
    const offsetMaxY = transformValues.offsetMax.y + dy;
    this.offsetMin = `${offsetMinX} ${offsetMinY}`;
    this.offsetMax = `${offsetMaxX} ${offsetMaxY}`;
  }
}