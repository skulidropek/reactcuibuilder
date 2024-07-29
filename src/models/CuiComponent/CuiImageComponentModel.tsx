import { makeObservable, observable, action } from 'mobx';
import CuiElementModel from '../CuiElement/CuiElementModel';
import ICuiComponent from './ICuiComponent';
import CuiImageComponentBase, { ImageType } from './ICuiImageComponent';

export default class CuiImageComponentModel extends CuiImageComponentBase {
  readonly type: string = "UnityEngine.UI.Image";
  public png?: string;
  public fadeIn?: number;
  public itemId?: number;
  public skinId?: bigint;
  readonly element: CuiElementModel;

  constructor(
    element: CuiElementModel,
  ) {
    super(); // вызов конструктора базового класса
    this.element = element;

    makeObservable(this, {
      png: observable,
      fadeIn: observable,
      itemId: observable,
      skinId: observable,
    });
  }

  ToCode(typeClass?: boolean): string {

    if(typeClass == null)
      typeClass = true;

    const components = [];

    if (this.color != null) components.push(`Color = "${this.color}"`);
    if (this.material != null) components.push(`Material = "${this.material}"`);
    if (this.sprite != null) components.push(`Sprite = "${this.sprite}"`);
    if (this.imageType != null) components.push(`ImageType = Image.Type.${this.imageType}`);
    if (this.png != null) components.push(`Png = "${this.png}"`);
    if (this.fadeIn != null) components.push(`FadeIn = ${this.fadeIn}`);
    if (this.itemId != null) components.push(`ItemId = ${this.itemId}`);
    if (this.skinId != null) components.push(`SkinId = ${this.skinId}`);

    return `${typeClass ? "new CuiImageComponent" : ""} { ${components.join(', ')} }`;
  }
}
