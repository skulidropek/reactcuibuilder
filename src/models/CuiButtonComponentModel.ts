import { makeObservable, observable, action } from 'mobx';
import CuiElementModel from './CuiElementModel';
import ICuiImageComponent, { ImageType } from './ICuiImageComponent';

export default class CuiButtonComponentModel implements ICuiImageComponent {
  type: string = "UnityEngine.UI.Button";
  command: string | null = null;
  close: string | null = null;
  sprite: string | undefined;
  material: string | undefined = undefined;
  color: string | undefined = undefined;
  imageType: ImageType | undefined = undefined;
  fadeIn: number | null = null;
  readonly element: CuiElementModel;

  constructor(element: CuiElementModel) {
    this.element = element;
    
    makeObservable(this, {
      command: observable,
      close: observable,
      sprite: observable,
      material: observable,
      color: observable,
      imageType: observable,
      fadeIn: observable,
      ToCode: action
    });
  }

  ToCode(): string {
    const properties = [
      this.command !== null ? `command: "${this.command}"` : null,
      this.close !== null ? `close: "${this.close}"` : null,
      this.sprite !== undefined ? `sprite: "${this.sprite}"` : null,
      this.material !== undefined ? `material: "${this.material}"` : null,
      this.color !== undefined ? `color: "${this.color}"` : null,
      this.imageType !== undefined ? `imageType: ${this.imageType}` : null,
      this.fadeIn !== null ? `fadeIn: ${this.fadeIn}` : null
    ].filter(property => property !== null); // Удаление null значений

    return `new CuiButtonComponentModel { ${properties.join(', ')} }`;
  }

  // Метод для сериализации в JSON
  toJSON() {
    return {
      type: this.type,
      command: this.command,
      close: this.close,
      sprite: this.sprite,
      material: this.material,
      color: this.color,
      imageType: this.imageType,
      fadeIn: this.fadeIn
    };
  }
}
