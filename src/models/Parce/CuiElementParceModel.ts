import CuiComponentBase from "../CuiComponent/CuiComponentBase";


export default interface CuiElementParceModel {
    type: 'CuiButton' | 'CuiPanel' | 'CuiLabel' | 'CuiElement';
    components: CuiComponentBase[];
    parent: string;
    name: string;
    destroyUi?: boolean;
    fadeOut?: number;
    update?: boolean;
}