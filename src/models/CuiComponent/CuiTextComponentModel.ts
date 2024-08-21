import { makeObservable, observable, action } from "mobx";
import CuiComponentBase from "./CuiComponentBase";
import CuiElementModel from "../CuiElement/CuiElementModel";
import { rustToRGBA } from "../../utils/colorUtils";
import Konva from "konva";

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

export enum Font {
  DroidSansMono = "droidsansmono.ttf",
  PermanentMarker = "permanentmarker.ttf",
  RobotoCondensedBold = "robotocondensed-bold.ttf",
  RobotoCondensedRegular = "robotocondensed-regular.ttf",
}

export interface TextPosition {
  textAlign: CanvasTextAlign;
  x: number;
  y: number;
  fontSize: number;
  lines: string[];
  lineHeight: number;
  color: string | undefined;
}

export default class CuiTextComponentModel extends CuiComponentBase {
  readonly type: string = "UnityEngine.UI.Text";
  text: string = "";
  fontSize: number = 14;
  font: Font = Font.RobotoCondensedRegular;
  align: TextAnchor = TextAnchor.UpperCenter;
  color: string = '0 0 0 1';
  verticalOverflow: VerticalWrapMode = VerticalWrapMode.Truncate;
  fadeIn: number = 0;

  constructor(element: CuiElementModel) {
    super(element);

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

  ToCode(typeClass?: boolean): string {

    if(typeClass == null)
      typeClass = true;
    
    const properties = [
      this.fadeIn !== null ? `FadeIn = ${this.fadeIn}` : null,
      this.color !== null ? `Color = "${this.color}"` : null,
      this.text !== undefined ? `Text = "${this.text}"` : null,
      this.fontSize !== undefined ? `FontSize = ${this.fontSize}` : null,
      this.font !== undefined ? `Font = "${this.font}"` : null,
      this.align !== undefined ? `Align = TextAnchor.${this.align}` : null,
      this.verticalOverflow !== undefined ? `VerticalOverflow = VerticalWrapMode.${this.verticalOverflow}` : null,
    ].filter(property => property !== null); // Удаление null значений

    return `${typeClass ? "new CuiTextComponent" : ""} { ${properties.join(', ')} }`;
  }

  generateTextPosition = (
    textComponent: CuiTextComponentModel,
    shape: { x: number; y: number; width: number; height: number }
  ): TextPosition => {
    let fontSize = textComponent.fontSize || 12;
    const padding = 0;
  
    let x = shape.x + padding;
    let y = shape.y + padding;
    const width = shape.width;
    const height = shape.height;
  
    const textAlign: CanvasTextAlign = 'left';
  
    const getTextWidth = (text: string, fontSize: number, fontFamily: string): number => {
      const tempText = new Konva.Text({
        text: text,
        fontSize: fontSize,
        fontFamily: fontFamily,
      });
      return tempText.width();
    };
  
    const getTextHeight = (text: string, fontSize: number, fontFamily: string): number => {
      const tempText = new Konva.Text({
        text: text,
        fontSize: fontSize,
        fontFamily: fontFamily,
        width: 1000,
      });
      return tempText.height();
    };
  
    const textWidth = getTextWidth(textComponent.text, fontSize, textComponent.font);
    const textHeight = getTextHeight(textComponent.text, fontSize, textComponent.font);
  
    // Поменяем местами Lower и Upper логики
    switch (textComponent.align) {
      case TextAnchor.UpperRight: 
        x += width - textWidth;
        y += height;
        break;
      case TextAnchor.LowerLeft: 
        y += textHeight;
        break;
      case TextAnchor.LowerRight:
        x += width - textWidth;
        y += textHeight;
        break;
      case TextAnchor.UpperLeft:
        y += height;
        break;
      case TextAnchor.MiddleCenter:
        x += (width - textWidth) * 0.5;
        y += (height + textHeight) * 0.5 - textHeight * 0.6;
        break;
      case TextAnchor.MiddleLeft:
        y += (height + textHeight) * 0.5 - textHeight * 0.6;
        break;
      case TextAnchor.MiddleRight:
        x += width - textWidth;
        y += (height + textHeight) * 0.5 - textHeight * 0.6;
        break;
      case TextAnchor.UpperCenter:
        x += (width - textWidth) * 0.5;
        y += height;
        break;
      case TextAnchor.LowerCenter:
        x += (width - textWidth) * 0.5;
        y += textHeight;
        break;
      default:
        y += textHeight;
        break;
    }
  
    return {
      textAlign,
      x,
      y,
      fontSize,
      lines: [textComponent.text],
      lineHeight: textHeight,
      color: textComponent.color ? rustToRGBA(textComponent.color) : undefined,
    };
  };
}