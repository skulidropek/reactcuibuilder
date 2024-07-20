import { makeObservable, observable, action } from 'mobx';
import CuiElementModel from './CuiElementModel';
import ICuiComponent from './ICuiComponent';

export enum ImageType {
    Simple,
    Sliced,
    Tiled,
    Filled
}

export default class CuiImageComponentModel implements ICuiComponent {
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
}
