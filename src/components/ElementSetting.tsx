import React from 'react';
import CuiRectTransform from './cui/CuiRectTransform';
import CuiElement from '../models/CuiElement';
import CuiRectTransformModel from '../models/CuiRectTransformModel';

interface ElementSettingProps {
  element: CuiElement;
  onChange: (key: keyof CuiElement, value: any) => void;
}

const ElementSetting: React.FC<ElementSettingProps> = ({ element, onChange }) => {
  switch (element.type) {
    case 'rect': {
      const cuiRectTransformModel = element.findComponentByType<CuiRectTransformModel>();

      if (cuiRectTransformModel == null) {
        return null;
      }

      return (
        <CuiRectTransform
          element={cuiRectTransformModel}
          onChange={(key: keyof CuiRectTransformModel, value: any) => {
            const updatedElement = element.updateComponent<CuiRectTransformModel>(
              { [key]: value }
            );
            onChange('components' as keyof CuiElement, updatedElement.components);
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
