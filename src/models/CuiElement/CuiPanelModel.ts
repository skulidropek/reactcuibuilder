import GraphicEditorStore from "../../components/Editor/GraphicEditorStore";
import CuiButtonComponentModel from "../CuiComponent/CuiButtonComponentModel";
import CuiElementModel from "./CuiElementModel";
import CuiImageComponentModel from "../CuiComponent/CuiImageComponentModel";
import CuiRectTransformModel from "../CuiComponent/CuiRectTransformModel";
import CuiTextComponentModel from "../CuiComponent/CuiTextComponentModel";
import CuiNeedsCursorComponentModel from "../CuiComponent/CuiNeedsCursorComponentModel";
import CuiNeedsKeyboardComponentModel from "../CuiComponent/CuiNeedsKeyboardComponentModel";

export default class CuiPanelModel extends CuiElementModel {

    constructor(
        id?: number,
    ) {
      super('CuiPanel', [], id); // Add the super() call here

      this.addComponent(new CuiImageComponentModel(this));
      this.addComponent(new CuiNeedsCursorComponentModel(this));
      this.addComponent(new CuiNeedsKeyboardComponentModel(this));
    }

    
    public image(): CuiImageComponentModel {
        return this.findComponentByType(CuiImageComponentModel)!;
    }

    public cursorEnabled(): boolean {
        return this.findComponentByType(CuiNeedsCursorComponentModel)?.isActive ?? false;
    } 

    public keyboardEnabled(): boolean {
        return this.findComponentByType(CuiNeedsKeyboardComponentModel)?.isActive ?? false;
    } 

    ToCode(): string {
        return `
        container.Add(new ${this.type}
        {
            KeyboardEnabled = ${this.keyboardEnabled()},
            CursorEnabled = ${this.cursorEnabled()},
            ${this.image().png ? `Image     = null, RawImage = new CuiRawImageComponent() { Png = ImageLibrary.Instance.GetImage("${this.image().png}"), },` : `Image = ${this.image().ToCode(false)},`}
            RectTransform = ${this.rectTransform().ToCode(false)},
        }, "${this?.parent instanceof GraphicEditorStore ? "Overlay" : this.parent?.id}", "${this.id}");

        ${this.children?.map(s => s?.ToCode()).join('\n')}
    `;
    }
}