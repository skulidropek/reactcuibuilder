import CuiComponentBase from "./CuiComponentBase";

export default abstract class ICuiActivatableComponent extends CuiComponentBase {
    abstract isActive: boolean;
}