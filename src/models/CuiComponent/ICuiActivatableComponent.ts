import ICuiComponent from "./ICuiComponent";

export default interface ICuiActivatableComponent extends ICuiComponent {
    isActive: boolean;
}