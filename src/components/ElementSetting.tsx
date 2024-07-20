import React from 'react';
import CuiRectTransform from './cui/CuiRectTransform';
import CuiElementModel from '../models/CuiElementModel';
import CuiRectTransformModel from '../models/CuiRectTransformModel';
import CuiImageComponentModel from '../models/CuiImageComponentModel'; // Импортируйте ваш класс
import { observer } from 'mobx-react-lite';
import ICuiComponent from '@/models/ICuiComponent';
import CuiImageComponent from './cui/CuiImageComponent';

interface ElementSettingProps {
  element: CuiElementModel;
}

const ElementSetting: React.FC<ElementSettingProps> = ({ element }) => {
  const renderComponent = (component: ICuiComponent) => {
    if (component instanceof CuiRectTransformModel) {
      const cuiRectTransformModel = component as CuiRectTransformModel;

      return (
        <CuiRectTransform
          element={cuiRectTransformModel}
          onChange={(key: keyof CuiRectTransformModel, value: any) => {
            element.updateComponent(
              CuiRectTransformModel,
              { [key]: value }
            );
          }}
        />
      );
    } else if (component instanceof CuiImageComponentModel) {
      const cuiImageComponentModel = component as CuiImageComponentModel;

      return (
        <CuiImageComponent
          element={cuiImageComponentModel}
          onChange={(key: keyof CuiImageComponentModel, value: any) => {
            element.updateComponent(
              CuiImageComponentModel,
              { [key]: value }
            );
          }}
        />
      );
    }
    // else if (component instanceof CuiButtonModel) {
    //   return <CuiButton element={element} onChange={onChange} />;
    // }
    // else if (component instanceof CuiLabelModel) {
    //   return <CuiLabel element={element} onChange={onChange} />;
    return null;
  };

  return (
    <div>
      {element?.components?.map((component, index) => (
        <div key={index}>
          {renderComponent(component)}
        </div>
      ))}
    </div>
  );
};

export default observer(ElementSetting);
