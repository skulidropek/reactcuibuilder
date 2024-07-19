import React from 'react';
import CuiRectTransform from './cui/CuiRectTransform';
import CuiElementModel from '../models/CuiElementModel';
import CuiRectTransformModel from '../models/CuiRectTransformModel';
import { observer } from 'mobx-react-lite';

interface ElementSettingProps {
  element: CuiElementModel;
}

const ElementSetting: React.FC<ElementSettingProps> = ({ element }) => {
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
            element.updateComponent<CuiRectTransformModel>(
              { [key]: value }
            );
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

export default observer(ElementSetting);
