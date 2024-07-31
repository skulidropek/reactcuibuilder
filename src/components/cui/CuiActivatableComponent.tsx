import React from 'react';
import { observer } from 'mobx-react-lite';
import { Form } from 'react-bootstrap';
import ICuiActivatableComponent from '../../models/CuiComponent/ICuiActivatableComponent';

interface CuiActivatableComponentProps {
  element: ICuiActivatableComponent;
  onChange: (key: keyof ICuiActivatableComponent, value: any) => void;
}

const CuiActivatableComponent: React.FC<CuiActivatableComponentProps> = ({ element, onChange }) => {
  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange('isActive', e.target.checked);
  };

  return (
    <div className="cui-activatable-component">
      <Form.Group controlId="isActive">
        <Form.Check
          type="checkbox"
          label="Active"
          name="isActive"
          checked={element.isActive}
          onChange={handleCheckboxChange}
        />
      </Form.Group>
    </div>
  );
};

export default observer(CuiActivatableComponent);
