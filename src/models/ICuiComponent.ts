export default interface ICuiComponent {
    type: string;
    ToCode(typeClass?: boolean): string;
}