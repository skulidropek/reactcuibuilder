import React from 'react';
import { Form } from 'react-bootstrap';

interface CuiButtonProps {
  element: any;
  onChange: (key: string, value: any) => void;
}

const CuiButton: React.FC<CuiButtonProps> = ({ element, onChange }) => {
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    onChange(name, value);
  };

  return (
    <div className="cui-button">
      <Form.Group controlId="buttonText">
        <Form.Label>Button Text</Form.Label>
        <Form.Control
          type="text"
          name="text"
          value={element.text || ''}
          onChange={handleInputChange}
        />
      </Form.Group>
      <Form.Group controlId="buttonColor">
        <Form.Label>Button Color</Form.Label>
        <Form.Control
          type="text"
          name="color"
          value={element.color || ''}
          onChange={handleInputChange}
        />
      </Form.Group>
      <Form.Group controlId="buttonCommand">
        <Form.Label>Button Command</Form.Label>
        <Form.Control
          type="text"
          name="command"
          value={element.command || ''}
          onChange={handleInputChange}
        />
      </Form.Group>
      {/* Add more fields as necessary */}
    </div>
  );
};

export default CuiButton;
