import GraphicEditorStore from "../components/Editor/GraphicEditorStore";
import CuiButtonComponentModel from "./CuiButtonComponentModel";
import CuiElementModel from "./CuiElementModel";
import CuiImageComponentModel from "./CuiImageComponentModel";
import CuiRectTransformModel from "./CuiRectTransformModel";
import CuiTextComponentModel from "./CuiTextComponentModel";

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
            // RawImage = { }
            CursorEnabled = false,
            Image = ${this.image().ToCode(false)},
            RectTransform = ${this.rectTransform().ToCode(false)},
        }, "${this?.parent instanceof GraphicEditorStore ? "Overlay" : this.parent?.id}", "${this.id}");

        ${this.children?.map(s => s?.ToCode()).join('\n')}
    `;
    }
}