import ICuiComponent from "./ICuiComponent";

export enum ImageType {
    Simple,
    Sliced,
    Tiled,
    Filled
}

export default interface ICuiImageComponent extends ICuiComponent {
    color?: string;
    imageType?: ImageType;
    sprite?: string;
    material?: string;
}