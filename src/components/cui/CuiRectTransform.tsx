import { observer } from 'mobx-react-lite';
import CuiRectTransformModel from '../../models/CuiComponent/CuiRectTransformModel';
import React from 'react';
import { Form } from 'react-bootstrap';

interface CuiRectTransformProps {
    element: CuiRectTransformModel;
    onChange: (key: keyof CuiRectTransformModel, value: any) => void;
}

const CuiRectTransform: React.FC<CuiRectTransformProps> = ({ element, onChange }) => {
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        const isValidNumber = (val: string) => /^-?\d*\.?\d*$/.test(val);

        // Разделяем значения по пробелам и проверяем каждое из них
        const values = value.split(' ');
        if (values.every(isValidNumber)) {
            onChange(name as keyof CuiRectTransformModel, value);
        }
    };

    return (
        <div className="cui-rect-transform">
            <Form.Group controlId="anchorMin">
                <Form.Label>Anchor Min</Form.Label>
                <Form.Control
                    type="text"
                    name="anchorMin"
                    value={element.anchorMin}
                    onChange={handleInputChange}
                />
            </Form.Group>
            <Form.Group controlId="anchorMax">
                <Form.Label>Anchor Max</Form.Label>
                <Form.Control
                    type="text"
                    name="anchorMax"
                    value={element.anchorMax}
                    onChange={handleInputChange}
                />
            </Form.Group>
            <Form.Group controlId="offsetMin">
                <Form.Label>Offset Min</Form.Label>
                <Form.Control
                    type="text"
                    name="offsetMin"
                    value={element.offsetMin}
                    onChange={handleInputChange}
                />
            </Form.Group>
            <Form.Group controlId="offsetMax">
                <Form.Label>Offset Max</Form.Label>
                <Form.Control
                    type="text"
                    name="offsetMax"
                    value={element.offsetMax}
                    onChange={handleInputChange}
                />
            </Form.Group>
        </div>
    );
};

export default observer(CuiRectTransform);
