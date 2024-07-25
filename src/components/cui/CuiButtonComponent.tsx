import React, { useState, useRef, useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import { Form, Button } from 'react-bootstrap';
import { ChromePicker, ColorResult } from 'react-color'; 
import CuiButtonComponentModel from '../../models/CuiButtonComponentModel';
import { ImageType } from '../../models/CuiImageComponentModel';

interface CuiButtonComponentProps {
  element: CuiButtonComponentModel;
  onChange: (key: keyof CuiButtonComponentModel, value: any) => void;
}

const CuiButtonComponent: React.FC<CuiButtonComponentProps> = ({ element, onChange }) => {
  const [colorPickerVisible, setColorPickerVisible] = useState(false);
  const colorPickerRef = useRef<HTMLDivElement>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    onChange(name as keyof CuiButtonComponentModel, value);
  };

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    onChange(name as keyof CuiButtonComponentModel, value !== '' ? Number(value) : undefined);
  };

  const handleColorChange = (color: ColorResult) => {
    onChange('color', `rgba(${color.rgb.r}, ${color.rgb.g}, ${color.rgb.b}, ${color.rgb.a})`);
  };

  const handleClickOutside = (event: MouseEvent) => {
    if (colorPickerRef.current && !colorPickerRef.current.contains(event.target as Node)) {
      setColorPickerVisible(false);
    }
  };

  useEffect(() => {
    if (colorPickerVisible) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [colorPickerVisible]);

  return (
    <div className="cui-button-component">
      <Form.Group controlId="command">
        <Form.Label>Command</Form.Label>
        <Form.Control
          type="text"
          name="command"
          value={element.command || ''}
          onChange={handleInputChange}
        />
      </Form.Group>
      <Form.Group controlId="close">
        <Form.Label>Close</Form.Label>
        <Form.Control
          type="text"
          name="close"
          value={element.close || ''}
          onChange={handleInputChange}
        />
      </Form.Group>
      <Form.Group controlId="sprite">
        <Form.Label>Sprite</Form.Label>
        <Form.Control
          type="text"
          name="sprite"
          value={element.sprite || ''}
          onChange={handleInputChange}
        />
      </Form.Group>
      <Form.Group controlId="material">
        <Form.Label>Material</Form.Label>
        <Form.Control
          type="text"
          name="material"
          value={element.material || ''}
          onChange={handleInputChange}
        />
      </Form.Group>
      <Form.Group controlId="color">
        <Form.Label>Color</Form.Label>
        <div style={{ position: 'relative' }}>
          <Button
            variant="primary"
            onClick={() => setColorPickerVisible(!colorPickerVisible)}
            style={{
              backgroundColor: element.color || '#000000',
              borderColor: '#000000',
              color: '#ffffff',
              width: '40px',
              height: '40px',
              padding: 0,
              borderRadius: '4px'
            }}
          />
          {colorPickerVisible && (
            <div ref={colorPickerRef} style={{ position: 'absolute', zIndex: 2 }}>
              <ChromePicker
                color={element.color || 'rgba(0,0,0,1)'}
                onChange={handleColorChange}
              />
            </div>
          )}
        </div>
      </Form.Group>
      <Form.Group controlId="imageType">
        <Form.Label>Image Type</Form.Label>
        <Form.Control
          as="select"
          name="imageType"
          value={element.imageType || ImageType.Simple}
          onChange={handleInputChange}
        >
          {Object.keys(ImageType)
            .filter(key => isNaN(Number(key)))  
            .map(type => (
              <option key={type} value={ImageType[type as keyof typeof ImageType]}>
                {type}
              </option>
          ))}
        </Form.Control>
      </Form.Group>
      <Form.Group controlId="fadeIn">
        <Form.Label>Fade In</Form.Label>
        <Form.Control
          type="number"
          name="fadeIn"
          value={element.fadeIn ?? ''}
          onChange={handleNumberChange}
        />
      </Form.Group>
    </div>
  );
};

export default observer(CuiButtonComponent);
