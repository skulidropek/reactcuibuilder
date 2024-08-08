import React, { useRef, useEffect, useCallback } from 'react';
import { observer } from 'mobx-react-lite';
import { Form, Button, Modal } from 'react-bootstrap';
import { ChromePicker, ColorResult } from 'react-color';
import { makeAutoObservable } from 'mobx';
import CuiImageComponentModel from '../../models/CuiComponent/CuiImageComponentModel';
import { ImageType } from '../../models/CuiComponent/ICuiImageComponent';
import { rustToRGBA, rustToHex, RGBAToRust } from '../../utils/colorUtils';

function importAll(r: __WebpackModuleApi.RequireContext): Record<string, string> {
  let images: Record<string, string> = {};
  r.keys().forEach((item: string) => {
    images[item.replace('./', '')] = r(item);
  });
  return images;
}

const images = importAll(require.context('../../../public/Sprites', false, /\.(png|jpe?g|svg)$/));

class CuiImageComponentState {
  colorPickerVisible = false;
  modalVisible = false;
  loadedImages: string[] = [];
  hasMoreImages = true;
  isLoading = false;

  constructor() {
    makeAutoObservable(this);
  }

  setColorPickerVisible(visible: boolean) {
    this.colorPickerVisible = visible;
  }

  setModalVisible(visible: boolean) {
    this.modalVisible = visible;
  }

  loadMoreImages(images: Record<string, string>, loadCount: number) {
    if (this.isLoading || !this.hasMoreImages) return;

    this.isLoading = true;
    const nextIndex = this.loadedImages.length;
    const moreImages = Object.keys(images).slice(nextIndex, nextIndex + loadCount);

    setTimeout(() => {
      this.loadedImages = [...this.loadedImages, ...moreImages];
      this.hasMoreImages = moreImages.length === loadCount;
      this.isLoading = false;
    }, 300);
  }

  handleClickOutside(ref: React.RefObject<HTMLDivElement>, event: MouseEvent) {
    if (ref.current && !ref.current.contains(event.target as Node)) {
      this.setColorPickerVisible(false);
    }
  }
}

interface CuiImageComponentProps {
  element: CuiImageComponentModel;
  onChange: (key: keyof CuiImageComponentModel, value: any) => void;
}

const CuiImageComponent: React.FC<CuiImageComponentProps> = ({ element, onChange }) => {
  const state = useRef(new CuiImageComponentState()).current; 
  const colorPickerRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreTriggerRef = useRef<HTMLDivElement>(null);
  const loadCount = 20;

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

  const handleImageChange = (selectedImage: string) => {
    onChange('sprite', selectedImage);
    state.setModalVisible(false);
  };

  useEffect(() => {
    state.loadMoreImages(images, loadCount);

    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          state.loadMoreImages(images, loadCount);
        }
      },
      { threshold: 0.1 }
    );

    if (loadMoreTriggerRef.current) {
      observerRef.current.observe(loadMoreTriggerRef.current);
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [state]);

  useEffect(() => {
    if (state.colorPickerVisible) {
      const handleClick = (event: MouseEvent) => state.handleClickOutside(colorPickerRef, event);
      document.addEventListener('mousedown', handleClick);
      return () => document.removeEventListener('mousedown', handleClick);
    }
  }, [state.colorPickerVisible]);

  const ImageContainer: React.FC<{ src: string; alt: string; onClick?: () => void }> = ({ src, alt, onClick }) => (
    <div
      style={{
        width: '64px',
        height: '64px',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        border: '1px solid #ddd',
        borderRadius: '4px',
        overflow: 'hidden',
        cursor: onClick ? 'pointer' : 'default',
      }}
      onClick={onClick}
    >
      <img
        src={src}
        alt={alt}
        style={{
          maxWidth: '100%',
          maxHeight: '100%',
          objectFit: 'contain',
        }}
      />
    </div>
  );

  return (
    <div className="cui-image-component">
      <Form.Group controlId="sprite">
        <Form.Label>Sprite</Form.Label>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          {element.sprite ? (
            <ImageContainer src={element.sprite} alt="Selected sprite" onClick={() => state.setModalVisible(true)} />
          ) : (
            <Button
              variant="outline-secondary"
              onClick={() => state.setModalVisible(true)}
              style={{
                width: '64px',
                height: '64px',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                borderRadius: '4px',
                border: '1px solid #ddd',
                overflow: 'hidden',
              }}
            >
              <img
                src={images['default-image.png']}
                alt="Default"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                }}
              />
              <span>Select Image</span>
            </Button>
          )}
        </div>
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
            onClick={() => state.setColorPickerVisible(!state.colorPickerVisible)}
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
          {state.colorPickerVisible && (
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
            .filter(key => isNaN(Number(key)))
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

      <Modal show={state.modalVisible} onHide={() => state.setModalVisible(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Select Image</Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ maxHeight: '400px', overflowY: 'auto' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap' }}>
            {state.loadedImages.map((imageName) => (
              <div key={imageName} style={{ margin: '5px', width: '50px', height: '50px', cursor: 'pointer' }}>
                <ImageContainer
                  src={images[imageName]}
                  alt={imageName}
                  onClick={() => handleImageChange(images[imageName])}
                />
              </div>
            ))}
          </div>
          {state.isLoading && <p>Loading more images...</p>}
          <div ref={loadMoreTriggerRef} style={{ height: '20px', backgroundColor: 'transparent' }}></div>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default observer(CuiImageComponent);
