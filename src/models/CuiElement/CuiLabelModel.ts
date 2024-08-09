import GraphicEditorStore from "../../components/Editor/GraphicEditorStore";
import CuiButtonComponentModel from "../CuiComponent/CuiButtonComponentModel";
import CuiElementModel from "./CuiElementModel";
import CuiImageComponentModel from "../CuiComponent/CuiImageComponentModel";
import CuiRectTransformModel from "../CuiComponent/CuiRectTransformModel";
import CuiTextComponentModel from "../CuiComponent/CuiTextComponentModel";

export default class CuiLabelModel extends CuiElementModel {

    constructor(
        id?: number,
    ) {
      super('CuiLabel', [], id); // Add the super() call here

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