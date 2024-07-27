import { makeObservable, observable, action } from "mobx";
import ICuiComponent from "./ICuiComponent";
import CuiElementModel from "./CuiElementModel";

  export enum TextAnchor {
    UpperLeft = "UpperLeft",
    UpperCenter = "UpperCenter",
    UpperRight = "UpperRight",
    MiddleLeft = "MiddleLeft",
    MiddleCenter = "MiddleCenter",
    MiddleRight = "MiddleRight",
    LowerLeft = "LowerLeft",
    LowerCenter = "LowerCenter",
    LowerRight = "LowerRight",
  }

  export enum VerticalWrapMode {
    Truncate = "Truncate",
    Overflow = "Overflow",
  }

export default class CuiTextComponentModel implements ICuiComponent {
  readonly type: string = "UnityEngine.UI.Text";
  text: string = "123123";
  fontSize: number = 14;
  font: string = "";
  align: TextAnchor = TextAnchor.UpperCenter;
  color?: string;
  verticalOverflow: VerticalWrapMode = VerticalWrapMode.Truncate;
  fadeIn: number = 0;
  readonly element: CuiElementModel;

  constructor(element: CuiElementModel) {
    this.element = element;

    makeObservable(this, {
      text: observable,
      fontSize: observable,
      font: observable,
      align: observable,
      color: observable,
      verticalOverflow: observable,
      fadeIn: observable,
    });
  }

  ToCode(): string {
    const properties = [
      this.fadeIn !== null ? `FadeIn = ${this.fadeIn}` : null,
      this.color !== null ? `Color = ${this.color}` : null,
      this.text !== undefined ? `Text = "${this.text}"` : null,
      this.fontSize !== undefined ? `FontSize = ${this.fontSize}` : null,
      this.font !== undefined ? `Font = "${this.font}"` : null,
      this.align !== undefined ? `Align = TextAnchor.${this.align}` : null,
      this.verticalOverflow !== undefined ? `VerticalOverflow = VerticalWrapMode.${this.verticalOverflow}` : null,
    ].filter(property => property !== null); // Удаление null значений

    return `new CuiTextComponent { ${properties.join(', ')} }`;
  }
}