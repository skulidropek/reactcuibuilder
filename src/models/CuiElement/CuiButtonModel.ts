import GraphicEditorStore from "../../components/Editor/GraphicEditorStore";
import CuiButtonComponentModel from "../CuiComponent/CuiButtonComponentModel";
import CuiElementModel from "./CuiElementModel";
import CuiRectTransformModel from "../CuiComponent/CuiRectTransformModel";
import CuiTextComponentModel from "../CuiComponent/CuiTextComponentModel";

export default class CuiButtonModel extends CuiElementModel {

    constructor(
    ) {
      super('CuiButton'); // Add the super() call here

      this.addComponent(new CuiButtonComponentModel(this));
      this.addComponent(new CuiTextComponentModel(this));
    }

    
    public button(): CuiButtonComponentModel {
        return this.findComponentByType(CuiButtonComponentModel)!;
    }
  
    public text(): CuiTextComponentModel {
        return this.findComponentByType(CuiTextComponentModel)!;
    }

    ToCode(): string {
        return `
        container.Add(new ${this.type}
        {
            Button = ${this.button().ToCode(false)},
            RectTransform = ${this.rectTransform().ToCode(false)},
            Text = ${this.text().ToCode(false)},
        }, "${this?.parent instanceof GraphicEditorStore ? "Overlay" : this.parent?.id}", "${this.id}");

        ${this.children?.map(s => s?.ToCode()).join('\n')}
    `;
    }
}