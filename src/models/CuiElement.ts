import ICuiComponent from "./ICuiComponent";

export default interface CuiElement {
    id: number;
    type: 'rect' | 'circle';
    visible: boolean;
    children: CuiElement[];
    components: ICuiComponent[];
    collapsed: boolean;
}