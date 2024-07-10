import React from 'react';
import CuiRectTransform from './cui/CuiRectTransform';
import { 
  CuiElement, 
  CuiRectTransformModel, 
  findComponentByType, 
  updateComponent 
} from '../models/types';

interface ElementSettingProps {
  element: CuiElement;
  onChange: (key: keyof CuiElement, value: any) => void;
}

const ElementSetting: React.FC<ElementSettingProps> = ({ element, onChange }) => {
  switch (element.type) {
    case 'rect': {
      const cuiRectTransformModel = findComponentByType<CuiRectTransformModel>(element);

      if (cuiRectTransformModel == null) {
        return null;
      }

      return (
        <CuiRectTransform
          element={cuiRectTransformModel}
          onChange={(key: keyof CuiRectTransformModel, value: any) => {
            const updatedElement = updateComponent<CuiRectTransformModel>(
              element,
              { [key]: value } as Partial<CuiRectTransformModel>
            );
            onChange('components', updatedElement.components);
          }}
        />
      );
    }
    // Здесь можно добавить другие case для других типов элементов
    // case 'CuiButton':
    //   return <CuiButton element={element} onChange={onChange} />;
    // case 'CuiLabel':
    //   return <CuiLabel element={element} onChange={onChange} />;
    default:
      return null;
  }
};

export default ElementSetting;