import CuiElementModel from "../CuiElement/CuiElementModel";
import ICuiActivatableComponent from "./ICuiActivatableComponent";
import ICuiComponent from "./ICuiComponent";

export default class CuiNeedsCursorComponentModel implements ICuiActivatableComponent {
    readonly type: string = "NeedsCursor";
    element: CuiElementModel;
    isActive = false;

    constructor(
        element: CuiElementModel,
      ) {
        this.element = element;
    }
    
    ToCode(typeClass?: boolean): string {
        
        if(typeClass == null)
            typeClass = true;
      
        return `${typeClass ? "new CuiNeedsCursorComponent" : ""} { }`;
    } 
}