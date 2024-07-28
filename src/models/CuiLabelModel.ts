import GraphicEditorStore from "../components/Editor/GraphicEditorStore";
import CuiButtonComponentModel from "./CuiButtonComponentModel";
import CuiElementModel from "./CuiElementModel";
import CuiImageComponentModel from "./CuiImageComponentModel";
import CuiRectTransformModel from "./CuiRectTransformModel";
import CuiTextComponentModel from "./CuiTextComponentModel";

export default class CuiLabelModel extends CuiElementModel {

    constructor(
    ) {
      super('CuiLabel'); // Add the super() call here

      this.addComponent(new CuiTextComponentModel(this));
    }

    
    public text(): CuiTextComponentModel {
        return this.findComponentByType(CuiTextComponentModel)!;
    }

    ToCode(): string {
        return `
        container.Add(new ${this.type}
        {
            Text = ${this.text().ToCode(false)},
            RectTransform = ${this.rectTransform().ToCode(false)},
        }, "${this?.parent instanceof GraphicEditorStore ? "Overlay" : this.parent?.id}", "${this.id}");

        ${this.children?.map(s => s?.ToCode()).join('\n')}
    `;
    }
}