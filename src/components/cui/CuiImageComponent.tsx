import { observer } from 'mobx-react-lite';
import React from 'react';
import { Form } from 'react-bootstrap';
import CuiImageComponentModel, { ImageType } from '../../models/CuiImageComponentModel';

interface CuiImageComponentProps {
    element: CuiImageComponentModel;
    onChange: (key: keyof CuiImageComponentModel, value: any) => void;
}

const CuiImageComponent: React.FC<CuiImageComponentProps> = ({ element, onChange }) => {
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        onChange(name as keyof CuiImageComponentModel, value);
    };

    const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        onChange(name as keyof CuiImageComponentModel, value !== '' ? Number(value) : undefined);
    };

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
                <Form.Control
                    type="text"
                    name="color"
                    value={element.color || ''}
                    onChange={handleInputChange}
                />
            </Form.Group>
            <Form.Group controlId="imageType">
                <Form.Label>Image Type</Form.Label>
                <Form.Control
                    as="select"
                    name="imageType"
                    value={element.imageType || ImageType.Simple}
                    onChange={handleInputChange}
                >
                    {Object.values(ImageType).map(type => (
                        <option key={type} value={type}>
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
