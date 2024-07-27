import { makeObservable, observable, action } from 'mobx';
import CuiElementModel from './CuiElementModel';
import CuiImageComponentBase, { ImageType } from './ICuiImageComponent';

export default class CuiButtonComponentModel extends CuiImageComponentBase {
  type: string = "UnityEngine.UI.Button";
  command: string | null = null;
  close: string | null = null;
  fadeIn: number | null = null;
  readonly element: CuiElementModel;

  constructor(element: CuiElementModel) {
    super();
    this.element = element;
    
    makeObservable(this, {
      command: observable,
      close: observable,
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
}
