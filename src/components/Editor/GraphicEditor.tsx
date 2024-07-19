import React, { useCallback, useState } from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import EditorControls from './EditorControls';
import ShapeHierarchy from './EditorHierarchy';
import EditorCanvas from '../EditorCanvas';
import GraphicEditorStore from './GraphicEditorStore';
import { observer } from 'mobx-react-lite';
import CuiElementModel from '../../models/CuiElementModel';

interface GraphicEditorProps {
  store: GraphicEditorStore;
}

const GraphicEditor: React.FC<GraphicEditorProps> = observer(({ store }) => {

  const handleShapeChange = useCallback((shapeId: number, key: keyof CuiElementModel, value: any) => {
    const element = store.getParentOrChildById(shapeId);
    if (element) {
      element.updateProperty(key, value);
    }
  }, [store]);

  const toggleShapeProperty = useCallback((shapeId: number, property: 'visible' | 'collapsed') => {
    const element = store.getParentOrChildById(shapeId);
    if (element) {
      element[property] = !element[property];
    }
  }, [store]);

  return (
    <Container fluid className="bg-light p-4">
      <Row>
        <Col xs={3}>
          <div className="d-flex flex-column">
            <EditorControls store={store} />
            <ShapeHierarchy
              store={store}
            />
          </div>
        </Col>
        <Col xs={9}>
          <EditorCanvas
            editorSize={store.size}
            items={store.children}
            onShapesChange={(updatedShapes) => {}}
          />
        </Col>
      </Row>
    </Container>
  );
});

export default GraphicEditor;
