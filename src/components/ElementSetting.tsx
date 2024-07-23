import React from 'react';
import CuiRectTransform from './cui/CuiRectTransform';
import CuiElementModel from '../models/CuiElementModel';
import CuiRectTransformModel from '../models/CuiRectTransformModel';
import CuiImageComponentModel from '../models/CuiImageComponentModel'; // Импортируйте ваш класс
import { observer } from 'mobx-react-lite';
import ICuiComponent from '@/models/ICuiComponent';
import CuiImageComponent from './cui/CuiImageComponent';
import { Button, Card } from 'react-bootstrap';
import { FaMinus, FaPlus } from 'react-icons/fa';

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
        <Card key={index} className="mb-2">
          <Card.Header className="d-flex justify-content-between align-items-center">
            <span>{component.type}</span>
            <Button variant="link" size="sm">
              <FaMinus />
            </Button>
          </Card.Header>
          <Card.Body>
            {renderComponent(component)}
          </Card.Body>
        </Card>
      ))}
    </div>
  );
};

export default observer(ElementSetting);
