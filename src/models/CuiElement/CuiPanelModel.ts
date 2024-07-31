import GraphicEditorStore from "../../components/Editor/GraphicEditorStore";
import CuiButtonComponentModel from "../CuiComponent/CuiButtonComponentModel";
import CuiElementModel from "./CuiElementModel";
import CuiImageComponentModel from "../CuiComponent/CuiImageComponentModel";
import CuiRectTransformModel from "../CuiComponent/CuiRectTransformModel";
import CuiTextComponentModel from "../CuiComponent/CuiTextComponentModel";

export default class CuiPanelModel extends CuiElementModel {

    constructor(
    ) {
      super('CuiPanel'); // Add the super() call here

      this.addComponent(new CuiImageComponentModel(this));
    }

    
    public image(): CuiImageComponentModel {
        return this.findComponentByType(CuiImageComponentModel)!;
    }

    ToCode(): string {
        return `
        container.Add(new ${this.type}
        {
            CursorEnabled = false,
            ${this.image().png ? `Image = null, RawImage = new CuiRawImageComponent() { Png = ImageLibrary.Instance.GetImage("${this.image().png}"), },` : 'Image = ${this.image().ToCode(false)},'}
            RectTransform = ${this.rectTransform().ToCode(false)},
        }, "${this?.parent instanceof GraphicEditorStore ? "Overlay" : this.parent?.id}", "${this.id}");

        ${this.children?.map(s => s?.ToCode()).join('\n')}
    `;
    }
}