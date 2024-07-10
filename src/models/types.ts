export interface CuiElement {
  id: number;
  type: 'rect' | 'circle';
  visible: boolean;
  children: CuiElement[];
  components: ICuiComponent[];
  collapsed: boolean;
}

export interface ICuiComponent {
  type: string;
}

export interface CuiRectTransformModel extends ICuiComponent {
  type: 'RectTransform';
  anchorMin: string;
  anchorMax: string;
  offsetMin: string;
  offsetMax: string;
}