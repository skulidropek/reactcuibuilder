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
    throw new Error("Method not implemented.");
  }
}