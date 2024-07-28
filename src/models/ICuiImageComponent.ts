import { makeObservable, observable, computed, action } from 'mobx';
import ICuiComponent from "./ICuiComponent";

export enum ImageType {
    Simple = "Simple",
    Sliced = "Sliced",
    Tiled = "Tiled",
    Filled = "Filled",
}

export default abstract class CuiImageComponentBase implements ICuiComponent {
    abstract type: string;
    abstract ToCode(typeClass?: boolean): string;
    
    color?: string;
    imageType?: ImageType;
    sprite?: string;
    material?: string;

    constructor() {
        makeObservable(this, {
            imageType: observable,
            sprite: observable,
            material: observable,
            color: observable,
        });
    }
}
