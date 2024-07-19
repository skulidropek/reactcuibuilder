import React from 'react';
import { FaPlus } from 'react-icons/fa';
import { Button, Form } from 'react-bootstrap';
import { Size } from '@/models/CuiRectTransformModel';
import { observer } from 'mobx-react-lite';
import GraphicEditorStore from './GraphicEditorStore';

interface EditorControlsProps {
  store: GraphicEditorStore;
}

const EditorControls: React.FC<EditorControlsProps> = ({ store }) => {
  return (
    <div className="bg-white p-4">
      <Form.Group controlId="editorWidth" className="mb-3">
        <Form.Label>Width:</Form.Label>
        <Form.Control
          type="number"
          value={store.size.width}
          onChange={(e) => store.size = {...store.size, width: Number(e.target.value)}}
        />
      </Form.Group>
      <Form.Group controlId="editorHeight" className="mb-3">
        <Form.Label>Height:</Form.Label>
        <Form.Control
          type="number"
          value={store.size.height}
          onChange={(e) => store.size = {...store.size, height: Number(e.target.value)}}
        />
      </Form.Group>
      <Button variant="primary" onClick={() => store.pushNewElement('rect')} className="mr-2 mb-2">
        <FaPlus className="mr-2" /> Rectangle
      </Button>
      <Button variant="primary" onClick={() => store.pushNewElement('circle')} className="mb-2">
        <FaPlus className="mr-2" /> Circle
      </Button>
    </div>
  );
};

export default observer(EditorControls);
