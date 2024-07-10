import React from 'react';
import { Form } from 'react-bootstrap';

interface NumberSettingProps {
  name: string;
  value: number;
  onChange: (name: string, value: number) => void;
}

const NumberSetting: React.FC<NumberSettingProps> = ({ name, value, onChange }) => {
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(name, parseFloat(e.target.value));
  };

  return (
    <Form.Group controlId={name}>
      <Form.Label>{name}</Form.Label>
      <Form.Control type="number" value={value} onChange={handleInputChange} />
    </Form.Group>
  );
};

export default NumberSetting;
