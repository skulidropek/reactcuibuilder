import React, { forwardRef } from 'react';
import { Button, Card } from 'react-bootstrap';
import { FaPlus, FaArrowsAlt } from 'react-icons/fa';
import ElementSetting from './ElementSetting';
import CuiElementModel from '../models/CuiElement/CuiElementModel';
import { observer } from 'mobx-react-lite';
import CuiPanelModel from '../models/CuiElement/CuiPanelModel';

interface ElementProfileProps {
  element: CuiElementModel;
}

const ElementProfile = forwardRef<HTMLDivElement, ElementProfileProps>(({ element }, ref) => {
  const handleAddChild = () => {
    element.pushChild(new CuiPanelModel());
  };

  const handleToggleFill = () => {
    element.visible = !element.visible;
  };

  return (
    <Card className="mb-2">
      <Card.Header className="d-flex justify-content-between align-items-center">
        <span>{element.id}</span>
      </Card.Header>
      <Card.Body ref={ref}>
        <div className="d-flex mb-2">
          <Button variant="success" size="sm" className="mr-2" onClick={handleAddChild}>
            <FaPlus />
          </Button>
          <Button variant="primary" size="sm" onClick={handleToggleFill}>
            <FaArrowsAlt />
          </Button>
        </div>
        <div className="mt-3">
          <Card className="mb-2">
            <Card.Header className="d-flex justify-content-between align-items-center">
              <b>Components</b>      
              <Button variant="link" size="sm">
                <FaPlus />
              </Button>
            </Card.Header>
          </Card>      
          <ElementSetting element={element} />
        </div>
      </Card.Body>
    </Card>
  );
});

export default observer(ElementProfile);
