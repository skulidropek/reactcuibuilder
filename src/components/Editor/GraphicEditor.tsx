import React, { useCallback, useEffect, useState } from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import EditorControls from './EditorControls';
import ShapeHierarchy from './EditorHierarchy';
import EditorCanvas from './EditorCanvas';
import GraphicEditorStore from './GraphicEditorStore';
import { observer } from 'mobx-react-lite';
import CuiElementModel from '../../models/CuiElement/CuiElementModel';
import EditorCanvasStore from './EditorCanvasStore';
import { autorun } from 'mobx';

interface GraphicEditorProps {
  store: GraphicEditorStore;
  canvasStore: EditorCanvasStore;
}

const GraphicEditor: React.FC<GraphicEditorProps> = observer(({ store, canvasStore }) => {

  canvasStore.preloadImages();

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
        <Col xs={9} style={{ width: store.size.width + 25, height: store.size.height }}>
          <EditorCanvas
            store={store}
            canvasStore={canvasStore}
          />
        </Col>
      </Row>
    </Container>
  );
});

export default GraphicEditor;
