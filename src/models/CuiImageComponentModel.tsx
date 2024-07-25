import { makeObservable, observable, action } from 'mobx';
import CuiElementModel from './CuiElementModel';
import ICuiComponent from './ICuiComponent';
import ICuiImageComponent, { ImageType } from './ICuiImageComponent';

export default class CuiImageComponentModel implements ICuiImageComponent {
  readonly type: string = "UnityEngine.UI.Image";
  public sprite?: string;
  public material?: string;
  public color?: string;
  public imageType?: ImageType;
  public png?: string;
  public fadeIn?: number;
  public itemId?: number;
  public skinId?: bigint;
  readonly element: CuiElementModel;

  constructor(
    element: CuiElementModel,
    sprite?: string,
    material?: string,
    color?: string,
    imageType?: ImageType,
    png?: string,
    fadeIn?: number,
    itemId?: number,
    skinId?: bigint,
  ) {
    this.element = element;
    this.sprite = sprite;
    this.material = material;
    this.color = color;
    this.imageType = imageType;
    this.png = png;
    this.fadeIn = fadeIn;
    this.itemId = itemId;
    this.skinId = skinId;

    makeObservable(this, {
      sprite: observable,
      material: observable,
      color: observable,
      imageType: observable,
      png: observable,
      fadeIn: observable,
      itemId: observable,
      skinId: observable,
    });
  }

  ToCode(): string {
    const components = [];

    if (this.color != null) {
        const colorValues = this.color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+),\s*([\d.]+)\)/);
        if (colorValues) {
            const [_, r, g, b, a] = colorValues;
            components.push(`Color = "${Number(r) / 255} ${Number(g) / 255} ${Number(b) / 255} ${a}"`);
        }
    }

    if (this.material != null) components.push(`Material = "${this.material}"`);
    if (this.sprite != null) components.push(`Sprite = "${this.sprite}"`);
    if (this.imageType != null) components.push(`ImageType = ${this.imageType}`);
    if (this.png != null) components.push(`Png = "${this.png}"`);
    if (this.fadeIn != null) components.push(`FadeIn = ${this.fadeIn}`);
    if (this.itemId != null) components.push(`ItemId = ${this.itemId}`);
    if (this.skinId != null) components.push(`SkinId = ${this.skinId}`);

    return `new CuiImageComponent { ${components.join(', ')} }`;
}
}
