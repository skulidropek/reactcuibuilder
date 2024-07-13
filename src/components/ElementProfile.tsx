import React, { forwardRef } from 'react';
import { Button, Card } from 'react-bootstrap';
import { FaPlus, FaArrowsAlt } from 'react-icons/fa';
import ElementSetting from './ElementSetting';
import CuiElement from '../models/CuiElement';

interface ElementProfileProps {
  element: any;
  onChange: (key: keyof CuiElement, value: any) => void;
  onAddChild: () => void;
  onToggleFill: () => void;
}

const ElementProfile = forwardRef<HTMLDivElement, ElementProfileProps>(({ element, onChange, onAddChild, onToggleFill }, ref) => {
  return (
    <Card className="mb-2">
      <Card.Header className="d-flex justify-content-between align-items-center">
        <span>{element.name}</span>
      </Card.Header>
      <Card.Body ref={ref}>
        <div className="d-flex mb-2">
          <Button variant="success" size="sm" className="mr-2" onClick={onAddChild}>
            <FaPlus />
          </Button>
          <Button variant="primary" size="sm" onClick={onToggleFill}>
            <FaArrowsAlt />
          </Button>
        </div>
        <ElementSetting element={element} onChange={onChange} />
        <div className="mt-3">
          <b>Components</b>
          {element.components?.map((component: any, index: number) => (
            <Card key={index} className="mb-2">
              <Card.Header className="d-flex justify-content-between align-items-center">
                <span>{component.name}</span>
                <Button variant="link" size="sm">
                  <FaPlus />
                </Button>
              </Card.Header>
              <Card.Body>
                <ElementSetting element={component} onChange={onChange} />
              </Card.Body>
            </Card>
          ))}
        </div>
      </Card.Body>
    </Card>
  );
});

export default ElementProfile;
