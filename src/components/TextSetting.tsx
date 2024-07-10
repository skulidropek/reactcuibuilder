import React from 'react';
import { Form } from 'react-bootstrap';

interface TextSettingProps {
  name: string;
  value: string;
  onChange: (name: string, value: string) => void;
}

const TextSetting: React.FC<TextSettingProps> = ({ name, value, onChange }) => {
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(name, e.target.value);
  };

  return (
    <Form.Group controlId={name}>
      <Form.Label>{name}</Form.Label>
      <Form.Control type="text" value={value} onChange={handleInputChange} />
    </Form.Group>
  );
};

export default TextSetting;
