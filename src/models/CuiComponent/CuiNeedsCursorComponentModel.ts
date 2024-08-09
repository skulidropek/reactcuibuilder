import CuiElementModel from "../CuiElement/CuiElementModel";
import ICuiActivatableComponent from "./ICuiActivatableComponent";
import CuiComponentBase from "./CuiComponentBase";

export default class CuiNeedsCursorComponentModel extends ICuiActivatableComponent {
    readonly type: string = "NeedsCursor";
    isActive = false;

    constructor(
        element: CuiElementModel,
      ) {
        super(element)
    }
    
    ToCode(typeClass?: boolean): string {
        
        if(typeClass == null)
            typeClass = true;
      
        return `${typeClass ? "new CuiNeedsCursorComponent" : ""} { }`;
    } 
}