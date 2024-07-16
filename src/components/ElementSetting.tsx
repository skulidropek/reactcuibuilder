import React from 'react';
import CuiRectTransform from './cui/CuiRectTransform';
import CuiElementModel from '../models/CuiElementModel';
import CuiRectTransformModel from '../models/CuiRectTransformModel';

interface ElementSettingProps {
  element: CuiElementModel;
  onChange: (key: keyof CuiElementModel, value: any) => void;
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
            onChange('components' as keyof CuiElementModel, updatedElement.components);
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
