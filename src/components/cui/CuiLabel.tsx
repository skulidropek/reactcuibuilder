import React from 'react';
import { Form } from 'react-bootstrap';

interface CuiLabelProps {
  element: any;
  onChange: (key: string, value: any) => void;
}

const CuiLabel: React.FC<CuiLabelProps> = ({ element, onChange }) => {
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    onChange(name, value);
  };

  return (
    <div className="cui-label">
      <Form.Group controlId="labelText">
        <Form.Label>Label Text</Form.Label>
        <Form.Control
          type="text"
          name="text"
          value={element.text || ''}
          onChange={handleInputChange}
        />
      </Form.Group>
      <Form.Group controlId="labelFontSize">
        <Form.Label>Font Size</Form.Label>
        <Form.Control
          type="number"
          name="fontSize"
          value={element.fontSize || ''}
          onChange={handleInputChange}
        />
      </Form.Group>
      <Form.Group controlId="labelAlignment">
        <Form.Label>Text Alignment</Form.Label>
        <Form.Control
          as="select"
          name="alignment"
          value={element.alignment || 'UpperLeft'}
          onChange={handleInputChange}
        >
          <option value="UpperLeft">UpperLeft</option>
          <option value="MiddleCenter">MiddleCenter</option>
          <option value="LowerRight">LowerRight</option>
          {/* Add more options as necessary */}
        </Form.Control>
      </Form.Group>
      {/* Add more fields as necessary */}
    </div>
  );
};

export default CuiLabel;
