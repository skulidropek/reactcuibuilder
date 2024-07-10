import React from 'react';
import { FaPlus } from 'react-icons/fa';
import { Button, Form } from 'react-bootstrap';

interface EditorControlsProps {
  editorSize: { width: number; height: number };
  setEditorSize: React.Dispatch<React.SetStateAction<{ width: number; height: number }>>;
  addShape: (type: 'rect' | 'circle') => void;
}

const EditorControls: React.FC<EditorControlsProps> = ({ editorSize, setEditorSize, addShape }) => {
  return (
    <div className="bg-white p-4">
      <Form.Group controlId="editorWidth" className="mb-3">
        <Form.Label>Width:</Form.Label>
        <Form.Control
          type="number"
          value={editorSize.width}
          onChange={(e) => setEditorSize({...editorSize, width: Number(e.target.value)})}
        />
      </Form.Group>
      <Form.Group controlId="editorHeight" className="mb-3">
        <Form.Label>Height:</Form.Label>
        <Form.Control
          type="number"
          value={editorSize.height}
          onChange={(e) => setEditorSize({...editorSize, height: Number(e.target.value)})}
        />
      </Form.Group>
      <Button variant="primary" onClick={() => addShape('rect')} className="mr-2 mb-2">
        <FaPlus className="mr-2" /> Rectangle
      </Button>
      <Button variant="primary" onClick={() => addShape('circle')} className="mb-2">
        <FaPlus className="mr-2" /> Circle
      </Button>
    </div>
  );
};

export default EditorControls;
