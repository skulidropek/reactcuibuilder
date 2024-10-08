import { makeObservable, observable, computed, action } from 'mobx';
import CuiComponentBase from "./CuiComponentBase";
import CuiElementModel from '../CuiElement/CuiElementModel';

export enum ImageType {
    Simple = "Simple",
    Sliced = "Sliced",
    Tiled = "Tiled",
    Filled = "Filled",
}

export default abstract class CuiImageComponentBase extends CuiComponentBase {
    abstract type: string;
    abstract ToCode(typeClass?: boolean): string;

    color: string = '0 0 0 0';
    imageType?: ImageType;
    sprite?: string;
    material?: string;

    constructor(element: CuiElementModel) {
        super(element)

        makeObservable(this, {
            imageType: observable,
            sprite: observable,
            material: observable,
            color: observable,
        });
    }

}
