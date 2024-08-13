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
    const minFontSize = 1;
    const padding = 5;
  
    let x = shape.x;
    let y = shape.y;
    const width = shape.width;
    const height = shape.height;
  
    let textAlign: 'left' | 'center' | 'right' = 'left';
  
    switch (textComponent.align) {
      case TextAnchor.UpperLeft:
      case TextAnchor.MiddleLeft:
      case TextAnchor.LowerLeft:
        textAlign = 'left';
        x += padding;
        break;
      case TextAnchor.UpperCenter:
      case TextAnchor.MiddleCenter:
      case TextAnchor.LowerCenter:
        textAlign = 'center';
        x += width / 2;
        break;
      case TextAnchor.UpperRight:
      case TextAnchor.MiddleRight:
      case TextAnchor.LowerRight:
        textAlign = 'right';
        x = shape.x + width - padding;
        break;
    }
  
    let verticalAlign: 'top' | 'middle' | 'bottom' = 'bottom';
    switch (textComponent.align) {
      case TextAnchor.UpperLeft:
      case TextAnchor.UpperCenter:
      case TextAnchor.UpperRight:
        verticalAlign = 'bottom';
        break;
      case TextAnchor.MiddleLeft:
      case TextAnchor.MiddleCenter:
      case TextAnchor.MiddleRight:
        verticalAlign = 'middle';
        break;
      case TextAnchor.LowerLeft:
      case TextAnchor.LowerCenter:
      case TextAnchor.LowerRight:
        verticalAlign = 'top';
        break;
    }
  
    const getLines = (text: string, maxWidth: number): string[] => {
      const words = text.split(' ');
      const lines: string[] = [];
      let currentLine = words[0];
  
      for (let i = 1; i < words.length; i++) {
        const word = words[i];
        const lineTest = currentLine + ' ' + word;
        const textWidth = getTextWidth(lineTest, fontSize, textComponent.font);
        if (textWidth < maxWidth - 2 * padding) {
          currentLine = lineTest;
        } else {
          lines.push(currentLine);
          currentLine = word;
        }
      }
      lines.push(currentLine);
      return lines;
    };
  
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
        // Установите ширину, достаточную для отображения всего текста, чтобы высота была корректной
        width: 1000
      });
      return tempText.height();
    };
  
    while (fontSize > minFontSize) {
      const lines = getLines(textComponent.text, width);
      const totalHeight = lines.length * getTextHeight('M', fontSize, textComponent.font) * 1.2;
  
      if (totalHeight <= height - 2 * padding) {
        break;
      }
  
      fontSize -= 1;
    }
  
    const lines = getLines(textComponent.text, width);
    const lineHeight = getTextHeight('M', fontSize, textComponent.font) * 1.2;
  
    let startY: number;
    const totalTextHeight = lines.length * lineHeight;
    switch (verticalAlign) {
      case 'top':
        startY = y + padding;
        break;
      case 'middle':
        startY = y + (height / 2) - (totalTextHeight / 2);
        break;
      case 'bottom':
        startY = y + height - totalTextHeight - padding;
        break;
    }
  
    if (textAlign === 'right') {
      x -= getTextWidth(lines[0], fontSize, textComponent.font);
    }
  
    return {
      textAlign,
      x,
      y: startY,
      fontSize,
      lines,
      lineHeight,
      color: textComponent.color ? rustToRGBA(textComponent.color) : undefined,
    };
  };
  
}