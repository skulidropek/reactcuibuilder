import CuiElementModel from "../CuiElement/CuiElementModel";
import ICuiActivatableComponent from "./ICuiActivatableComponent";
import CuiComponentBase from "./CuiComponentBase";

export default class CuiNeedsKeyboardComponentModel extends ICuiActivatableComponent {
    readonly type: string = "NeedsKeyboard";
    isActive = false;

    constructor(
        element: CuiElementModel,
      ) {
        super(element);
    }
    
    ToCode(typeClass?: boolean): string {
        
        if(typeClass == null)
            typeClass = true;
      
        return `${typeClass ? "new CuiNeedsKeyboardComponent" : ""} { }`;
    } 
}