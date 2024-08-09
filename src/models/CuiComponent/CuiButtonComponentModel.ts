import { makeObservable, observable, action } from 'mobx';
import CuiElementModel from '../CuiElement/CuiElementModel';
import CuiImageComponentBase, { ImageType } from './ICuiImageComponent';

export default class CuiButtonComponentModel extends CuiImageComponentBase {
  type: string = "UnityEngine.UI.Button";
  command: string | null = null;
  close: string | null = null;
  fadeIn: number | null = null;

  constructor(element: CuiElementModel) {
    super(element);
    
    makeObservable(this, {
      command: observable,
      close: observable,
      fadeIn: observable,
      ToCode: action
    });
  }

  ToCode(typeClass?: boolean): string {

    if(typeClass == null)
      typeClass = true;

    const properties = [
      this.command !== null ? `Command = "${this.command}"` : null,
      this.close !== null ? `Close = "${this.close}"` : null,
      this.sprite !== undefined ? `Sprite = "${this.sprite}"` : null,
      this.material !== undefined ? `Material = "${this.material}"` : null,
      this.color !== undefined ? `Color = "${this.color}"` : null,
      this.imageType !== undefined ? `ImageType = Image.Type.${this.imageType}` : null,
      this.fadeIn !== null ? `FadeIn = ${this.fadeIn}` : null
    ].filter(property => property !== null); // Удаление null значений

    return `${typeClass ?  "new CuiButtonComponent" : ""} { ${properties.join(', ')} }`;
  }
}
