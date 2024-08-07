import React, { useState, useRef, useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import { Form, Button, Modal } from 'react-bootstrap';
import Select from 'react-select';
import { ChromePicker, ColorResult } from 'react-color';
import CuiImageComponentModel from '../../models/CuiComponent/CuiImageComponentModel';
import { ImageType } from '../../models/CuiComponent/ICuiImageComponent';
import { rustToRGBA, rustToHex, RGBAToRust } from '../../utils/colorUtils';

// Импорт всех изображений из папки
function importAll(r: __WebpackModuleApi.RequireContext): Record<string, string> {
  let images: Record<string, string> = {};
  r.keys().forEach((item: string) => {
    images[item.replace('./', '')] = r(item);
  });
  return images;
}

const images = importAll(require.context('../../../public/Sprites', false, /\.(png|jpe?g|svg)$/));

interface ImageOption {
  value: string;
  label: JSX.Element;
}

interface CuiImageComponentProps {
  element: CuiImageComponentModel;
  onChange: (key: keyof CuiImageComponentModel, value: any) => void;
}

const CuiImageComponent: React.FC<CuiImageComponentProps> = ({ element, onChange }) => {
  const [colorPickerVisible, setColorPickerVisible] = useState<boolean>(false);
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [loadedImages, setLoadedImages] = useState<string[]>([]);
  const colorPickerRef = useRef<HTMLDivElement>(null);
  const loadCount = 10; // Количество изображений для загрузки за раз

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    onChange(name as keyof CuiImageComponentModel, value);
  };

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    onChange(name as keyof CuiImageComponentModel, value !== '' ? Number(value) : undefined);
  };

  const handleColorChange = (color: ColorResult) => {
    onChange('color', RGBAToRust(color));
  };

  const handleClickOutside = (event: MouseEvent) => {
    if (colorPickerRef.current && !colorPickerRef.current.contains(event.target as Node)) {
      setColorPickerVisible(false);
    }
  };

  const handleImageChange = (selectedOption: string) => {
    onChange('sprite', selectedOption);
    setModalVisible(false);
  };

  const loadMoreImages = () => {
    const nextIndex = loadedImages.length;
    const moreImages = Object.keys(images).slice(nextIndex, nextIndex + loadCount);
    setLoadedImages([...loadedImages, ...moreImages]);
  };

  useEffect(() => {
    loadMoreImages();
  }, []);

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
        <Button variant="primary" onClick={() => setModalVisible(true)}>
          Select Image
        </Button>
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
              backgroundColor: rustToHex(element.color),
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
                color={rustToRGBA(element.color)}
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
      
      <Modal show={modalVisible} onHide={() => setModalVisible(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Select Image</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div style={{ display: 'flex', flexWrap: 'wrap' }}>
            {loadedImages.map((key) => (
              <div key={key} style={{ margin: '5px' }} onClick={() => handleImageChange(images[key])}>
                <img src={images[key]} alt={key} style={{ width: '50px', cursor: 'pointer' }} />
              </div>
            ))}
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setModalVisible(false)}>
            Close
          </Button>
          <Button variant="primary" onClick={loadMoreImages}>
            Load More
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default observer(CuiImageComponent);
