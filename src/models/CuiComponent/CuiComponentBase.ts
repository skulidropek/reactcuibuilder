import { makeObservable } from "mobx";
import CuiElementModel from "../CuiElement/CuiElementModel";

export default abstract class CuiComponentBase {
    abstract type: string;
    abstract ToCode(typeClass?: boolean): string;
    readonly element: CuiElementModel;  

    constructor(element: CuiElementModel) {
        this.element = element;
    }
}