import React, { useState, useRef, useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import { Form, Button } from 'react-bootstrap';
import { ChromePicker, ColorResult } from 'react-color'; // Import ChromePicker from 'react-color'
import CuiImageComponentModel, { ImageType } from '../../models/CuiImageComponentModel';

interface CuiImageComponentProps {
  element: CuiImageComponentModel;
  onChange: (key: keyof CuiImageComponentModel, value: any) => void;
}

const CuiImageComponent: React.FC<CuiImageComponentProps> = ({ element, onChange }) => {
  const [colorPickerVisible, setColorPickerVisible] = useState(false);
  const colorPickerRef = useRef<HTMLDivElement>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    onChange(name as keyof CuiImageComponentModel, value);
  };

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    onChange(name as keyof CuiImageComponentModel, value !== '' ? Number(value) : undefined);
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
    <div className="cui-image-component">
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
            .filter(key => isNaN(Number(key)))  // Фильтруем только строковые ключи
            .map(type => (
              <option key={type} value={ImageType[type as keyof typeof ImageType]}>
                {type}
              </option>
          ))}
        </Form.Control>
      </Form.Group>
      <Form.Group controlId="png">
        <Form.Label>PNG</Form.Label>
        <Form.Control
          type="text"
          name="png"
          value={element.png || ''}
          onChange={handleInputChange}
        />
      </Form.Group>
      <Form.Group controlId="fadeIn">
        <Form.Label>Fade In</Form.Label>
        <Form.Control
          type="number"
          name="fadeIn"
          value={element.fadeIn !== undefined ? element.fadeIn : ''}
          onChange={handleNumberChange}
        />
      </Form.Group>
      <Form.Group controlId="itemId">
        <Form.Label>Item ID</Form.Label>
        <Form.Control
          type="number"
          name="itemId"
          value={element.itemId !== undefined ? element.itemId : ''}
          onChange={handleNumberChange}
        />
      </Form.Group>
      <Form.Group controlId="skinId">
        <Form.Label>Skin ID</Form.Label>
        <Form.Control
          type="number"
          name="skinId"
          value={element.skinId !== undefined ? Number(element.skinId) : ''}
          onChange={handleNumberChange}
        />
      </Form.Group>
    </div>
  );
};

export default observer(CuiImageComponent);
