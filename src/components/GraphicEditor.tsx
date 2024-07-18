import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import EditorControls from './EditorControls';
import ShapeHierarchy from './ShapeHierarchy';
import EditorCanvas from './EditorCanvas';
import CuiElementModel from '../models/CuiElementModel';
import CuiRectTransformModel, { Size } from '../models/CuiRectTransformModel';
import GraphicEditorModel from '../models/GraphicEditorModel';

const GraphicEditor = () => {
  const graphicEditor = useRef(new GraphicEditorModel({ width: 1282, height: 722 }, []));
  const [, setSize] = useState(graphicEditor.current.getSize());
  const [draggingItem, setDraggingItem] = useState<number | null>(null);

  useEffect(() => {
    const updateSize = () => {
      setSize(graphicEditor.current.getSize());
    };

    graphicEditor.current.subscribe(updateSize);
    return () => {
      graphicEditor.current.unsubscribe(updateSize);
    };
  }, []);

  const moveShape = useCallback((sourceId: number, targetId: number | 'root') => {
    const sourceElement = graphicEditor.current.getParentOrChildById(sourceId);
    const targetElement = targetId !== 'root' ? graphicEditor.current.getParentOrChildById(targetId) : null;

    if (sourceElement) {
      if (targetElement) {
        sourceElement.parent = targetElement;
        targetElement.children.push(sourceElement);
      } else {
        sourceElement.parent = graphicEditor.current; // Move to root
      }

      graphicEditor.current.notifySubscribers();
    }
  }, []);

  const addShape = useCallback((type: 'rect' | 'circle') => {
    graphicEditor.current.pushNewElement(type);
  }, []);

  const handleShapeChange = useCallback((shapeId: number, key: keyof CuiElementModel, value: any) => {
    const element = graphicEditor.current.getParentOrChildById(shapeId);
    if (element != null) {
      element.updateProperty(key, value);
    }
  }, []);

  const toggleVisibility = useCallback((shapeId: number) => {
    const element = graphicEditor.current.getParentOrChildById(shapeId);
    if (element != null) {
      element.visible = !element.visible;
      element.notifySubscribers();
    }
  }, []);

  const toggleCollapse = useCallback((shapeId: number) => {
    const element = graphicEditor.current.getParentOrChildById(shapeId);
    if (element != null) {
      element.collapsed = !element.collapsed;
      element.notifySubscribers();
    }
  }, []);

  const handleDragStart = useCallback((e: React.DragEvent, shapeId: number) => {
    setDraggingItem(shapeId);
    e.dataTransfer.setData('text/plain', shapeId.toString());
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => { e.preventDefault(); console.log('drag over') }, []);

  const handleDrop = useCallback((e: React.DragEvent, targetId: number | 'root') => {
    e.preventDefault();
    const sourceId = parseInt(e.dataTransfer.getData('text/plain'), 10);
    moveShape(sourceId, targetId);
    setDraggingItem(null);
  }, [moveShape]);

  const moveToRoot = useCallback((shapeId: number) => {
    moveShape(shapeId, 'root');
  }, [moveShape]);

  const setSelectedShape = useCallback((shapeId: number | null) => {
    if (shapeId !== null) {
      const element = graphicEditor.current.getParentOrChildById(shapeId);
      if (element != null) {
        element.selected = !element.selected;
        element.notifySubscribers();
      }
    }
  }, []);

  return (
    <Container fluid className="bg-light p-4">
      <Row>
        <Col xs={3}>
          <div className="d-flex flex-column">
            <EditorControls
              editorSize={graphicEditor.current.getSize()}
              setEditorSize={(size: Size) => graphicEditor.current.setSize(size) }
              addShape={addShape}
            />
            <ShapeHierarchy
              graphicEditor={graphicEditor.current}
              handleDragOver={handleDragOver}
              handleDrop={handleDrop}
              handleDragStart={handleDragStart}
              toggleVisibility={toggleVisibility}
              toggleCollapse={toggleCollapse}
              handleProfileChange={handleShapeChange}
              moveToRoot={moveToRoot}
              draggingItem={draggingItem}
              setSelectedShape={setSelectedShape}
            />
          </div>
        </Col>
        <Col xs={9}>
          <EditorCanvas
            editorSize={graphicEditor.current.getSize()}
            items={graphicEditor.current.children}
            onShapesChange={(updatedShapes: CuiElementModel[]) => {}}
            setSelectedShape={setSelectedShape}
          />
        </Col>
      </Row>
    </Container>
  );
};

export default GraphicEditor;
