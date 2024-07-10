import React from 'react';
import { Form } from 'react-bootstrap';

interface CuiPanelProps {
  element: any;
  onChange: (key: string, value: any) => void;
}

const CuiPanel: React.FC<CuiPanelProps> = ({ element, onChange }) => {
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    onChange(name, value);
  };

  return (
    <div className="cui-panel">
      <Form.Group controlId="panelColor">
        <Form.Label>Panel Color</Form.Label>
        <Form.Control
          type="text"
          name="color"
          value={element.color || ''}
          onChange={handleInputChange}
        />
      </Form.Group>
      <Form.Group controlId="cursorEnabled">
        <Form.Check
          type="checkbox"
          label="Cursor Enabled"
          name="cursorEnabled"
          checked={element.cursorEnabled || false}
          onChange={(e) => onChange(e.target.name, e.target.checked)}
        />
      </Form.Group>
      {/* Add more fields as necessary */}
    </div>
  );
};

export default CuiPanel;
