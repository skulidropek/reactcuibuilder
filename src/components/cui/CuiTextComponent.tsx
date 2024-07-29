import React, { useState, useRef, useEffect, ChangeEvent } from 'react';
import { observer } from 'mobx-react-lite';
import { Form, Button } from 'react-bootstrap';
import { ChromePicker, ColorResult } from 'react-color';
import CuiTextComponentModel, { Font, TextAnchor, VerticalWrapMode } from '../../models/CuiComponent/CuiTextComponentModel';
import { rustToRGBA, rustToHex, RGBAToRust } from '../../utils/colorUtils';

interface CuiTextComponentProps {
  element: CuiTextComponentModel;
  onChange: (key: keyof CuiTextComponentModel, value: any) => void;
}

const CuiTextComponent: React.FC<CuiTextComponentProps> = observer(({ element, onChange }) => {
  const [colorPickerVisible, setColorPickerVisible] = useState(false);
  const colorPickerRef = useRef<HTMLDivElement>(null);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    onChange(name as keyof CuiTextComponentModel, value);
  };

  const handleNumberChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    onChange(name as keyof CuiTextComponentModel, value !== '' ? Number(value) : undefined);
  };

  const handleColorChange = (color: ColorResult) => {
    onChange('color', RGBAToRust(color));
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
    <div className="cui-text-component">
      <Form.Group controlId="text">
        <Form.Label>Text</Form.Label>
        <Form.Control
          type="text"
          name="text"
          value={element.text}
          onChange={handleChange}
        />
      </Form.Group>
      <Form.Group controlId="fontSize">
        <Form.Label>Font Size</Form.Label>
        <Form.Control
          type="number"
          name="fontSize"
          value={element.fontSize ?? ''}
          onChange={handleNumberChange}
        />
      </Form.Group>
      <Form.Group controlId="font">
        <Form.Label>Font</Form.Label>
        <Form.Select
          name="font"
          value={element.font}
          onChange={handleChange}
        >
          {Object.entries(Font).map(([key, value]) => (
            <option key={key} value={value}>
              {key}
            </option>
          ))}
        </Form.Select>
      </Form.Group>
      <Form.Group controlId="align">
        <Form.Label>Alignment</Form.Label>
        <Form.Select
          name="align"
          value={element.align}
          onChange={handleChange}
        >
          {Object.entries(TextAnchor).map(([key, value]) => (
            <option key={key} value={value}>
              {key}
            </option>
          ))}
        </Form.Select>
      </Form.Group>
      <Form.Group controlId="color">
        <Form.Label>Color</Form.Label>
        <div style={{ position: 'relative' }}>
          <Button
            variant="outline-secondary"
            onClick={() => setColorPickerVisible(!colorPickerVisible)}
            style={{
              backgroundColor: rustToHex(element.color),
              width: '40px',
              height: '40px',
              padding: 0,
              border: '1px solid #ced4da',
            }}
          />
          {colorPickerVisible && (
            <div ref={colorPickerRef} style={{ position: 'absolute', zIndex: 2, marginTop: '5px' }}>
              <ChromePicker
                color={rustToRGBA(element.color)}
                onChange={handleColorChange}
              />
            </div>
          )}
        </div>
      </Form.Group>
      <Form.Group controlId="verticalOverflow">
        <Form.Label>Vertical Overflow</Form.Label>
        <Form.Select
          name="verticalOverflow"
          value={element.verticalOverflow}
          onChange={handleChange}
        >
          {Object.entries(VerticalWrapMode).map(([key, value]) => (
            <option key={key} value={value}>
              {key}
            </option>
          ))}
        </Form.Select>
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
});

export default CuiTextComponent;