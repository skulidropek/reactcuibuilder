import React from 'react';
import CuiRectTransform from './cui/CuiRectTransform';
import CuiElementModel from '../models/CuiElement/CuiElementModel';
import CuiRectTransformModel from '../models/CuiComponent/CuiRectTransformModel';
import CuiImageComponentModel from '../models/CuiComponent/CuiImageComponentModel';
import { observer } from 'mobx-react-lite';
import ICuiComponent from '@/models/CuiComponent/ICuiComponent';
import CuiImageComponent from './cui/CuiImageComponent';
import { Button, Card } from 'react-bootstrap';
import { FaMinus } from 'react-icons/fa';
import CuiButtonComponentModel from '../models/CuiComponent/CuiButtonComponentModel';
import CuiButtonComponent from './cui/CuiButtonComponent';
import CuiTextComponentModel from '../models/CuiComponent/CuiTextComponentModel';
import CuiTextComponent from './cui/CuiTextComponent';
import CuiNeedsCursorComponentModel from '../models/CuiComponent/CuiNeedsCursorComponentModel';
import CuiActivatableComponent from './cui/CuiActivatableComponent';
import CuiNeedsKeyboardComponentModel from '../models/CuiComponent/CuiNeedsKeyboardComponentModel';

interface ElementSettingProps {
  element: CuiElementModel;
  onRemoveComponent?: (index: number) => void;
}

const ElementSetting: React.FC<ElementSettingProps> = observer(({ element, onRemoveComponent }) => {
  const handleComponentChange = <T extends ICuiComponent>(
    ComponentModel: new (...args: any[]) => T,
    key: keyof T,
    value: T[keyof T]
  ) => {
    element.updateComponent(ComponentModel, { [key]: value } as Partial<T>);
  };

  const renderComponent = (component: ICuiComponent) => {
    if (component instanceof CuiRectTransformModel) {
      return (
        <CuiRectTransform
          element={component}
          onChange={(key, value) => handleComponentChange(CuiRectTransformModel, key, value)}
        />
      );
    } else if (component instanceof CuiImageComponentModel) {
      return (
        <CuiImageComponent
          element={component}
          onChange={(key, value) => handleComponentChange(CuiImageComponentModel, key, value)}
        />
      );
    } else if (component instanceof CuiButtonComponentModel) {
      return (
        <CuiButtonComponent
          element={component}
          onChange={(key, value) => handleComponentChange(CuiButtonComponentModel, key, value)}
        />
      );
    } else if (component instanceof CuiTextComponentModel) {
      return (
        <CuiTextComponent
          element={component}
          onChange={(key, value) => handleComponentChange(CuiTextComponentModel, key, value)}
        />
      );
    } else if(component instanceof CuiNeedsCursorComponentModel) {
      return (
        <CuiActivatableComponent 
          element={component}
          onChange={(key, value) => handleComponentChange(CuiNeedsCursorComponentModel, key, value)}
        />
      )
    } else if(component instanceof CuiNeedsKeyboardComponentModel) {
      return (
        <CuiActivatableComponent 
          element={component}
          onChange={(key, value) => handleComponentChange(CuiNeedsKeyboardComponentModel, key, value)}
        />
      )
    }
    return null;
  };

  const handleRemoveComponent = (index: number) => {
    if (onRemoveComponent) {
      onRemoveComponent(index);
    } else {
      console.warn('onRemoveComponent is not defined');
    }
  };

  return (
    <div>
      {element?.components?.map((component, index) => (
        <Card key={index} className="mb-2">
          <Card.Header className="d-flex justify-content-between align-items-center">
            <span>{component.type}</span>
            <Button 
              variant="link" 
              size="sm" 
              onClick={() => handleRemoveComponent(index)}
            >
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
});

export default ElementSetting;