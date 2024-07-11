import React, { useState, useCallback } from 'react';
import EditorControls from './EditorControls';
import ShapeHierarchy from './ShapeHierarchy';
import EditorCanvas from './EditorCanvas';
import CuiElement from '../models/CuiElement';
import CuiRectTransformModel from '../models/CuiRectTransformModel';
import { Container, Row, Col } from 'react-bootstrap';

const GraphicEditor = () => {
  const [shapes, setShapes] = useState<CuiElement[]>([]);
  const [selectedShape, setSelectedShape] = useState<number | null>(null);
  const [editorSize, setEditorSize] = useState({ width: 1282, height: 722 });
  const [draggingItem, setDraggingItem] = useState<number | null>(null);

  const addShape = useCallback((type: 'rect' | 'circle') => {
    const newShape: CuiElement = {
      id: Date.now(),
      type,
      visible: true,
      children: [],
      components: [  {
        type: 'RectTransform',
        anchorMin: '0 0',
        anchorMax: '0.1 0.1',
        offsetMin: '0 0',
        offsetMax: '0 0',
      } as CuiRectTransformModel
      ],
      collapsed: false,
    };
    setShapes((prevShapes) => [...prevShapes, newShape]);
  }, []);

  const handleShapeChange = useCallback((updatedShapes: CuiElement[]) => {
    setShapes(updatedShapes);
  }, []);

  const handleProfileChange = useCallback((shapeId: number, key: keyof CuiElement, value: any) => {
    setShapes((prevShapes) => 
      prevShapes.map(shape => 
        shape.id === shapeId ? { ...shape, [key]: value } : shape
      )
    );
  }, []);

  const toggleVisibility = useCallback((shapeId: number) => {
    setShapes((prevShapes) => {
      return prevShapes.map((shape) => {
        if (shape.id === shapeId) {
          return { ...shape, visible: !shape.visible };
        } else if (shape.children.length > 0) {
          return { ...shape, children: toggleShapeVisibility(shape.children, shapeId) };
        }
        return shape;
      });
    });
  }, []);

  const toggleShapeVisibility = useCallback((shapes: CuiElement[], id: number): CuiElement[] => {
    return shapes.map((shape) => {
      if (shape.id === id) {
        return { ...shape, visible: !shape.visible };
      } else if (shape.children.length > 0) {
        return { ...shape, children: toggleShapeVisibility(shape.children, id) };
      }
      return shape;
    });
  }, []);

  const toggleCollapse = useCallback((shapeId: number) => {
    setShapes((prevShapes) => {
      return prevShapes.map((shape) => {
        if (shape.id === shapeId) {
          return { ...shape, collapsed: !shape.collapsed };
        } else if (shape.children.length > 0) {
          return { ...shape, children: toggleShapeCollapse(shape.children, shapeId) };
        }
        return shape;
      });
    });
  }, []);

  const toggleShapeCollapse = useCallback((shapes: CuiElement[], id: number): CuiElement[] => {
    return shapes.map((shape) => {
      if (shape.id === id) {
        return { ...shape, collapsed: !shape.collapsed };
      } else if (shape.children.length > 0) {
        return { ...shape, children: toggleShapeCollapse(shape.children, id) };
      }
      return shape;
    });
  }, []);

  const handleDragStart = useCallback((e: React.DragEvent, shapeId: number) => {
    setDraggingItem(shapeId);
    e.dataTransfer.setData('text/plain', shapeId.toString());
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent, targetId: number | 'root') => {
    e.preventDefault();
    const sourceId = parseInt(e.dataTransfer.getData('text/plain'), 10);
    setShapes((prevShapes) => {
      return moveShape(prevShapes, sourceId, targetId);
    });
    setDraggingItem(null);
  }, []);

  const isDescendant = useCallback((parent: CuiElement, childId: number): boolean => {
    return parent.children.some((child) => child.id === childId || isDescendant(child, childId));
  }, []);

  const findShapeById = useCallback((shapes: CuiElement[], id: number): CuiElement | null => {
    for (let shape of shapes) {
      if (shape.id === id) return shape;
      if (shape.children.length > 0) {
        const found = findShapeById(shape.children, id);
        if (found) return found;
      }
    }
    return null;
  }, []);

  const moveShape = useCallback((shapes: CuiElement[], sourceId: number, targetId: number | 'root'): CuiElement[] => {
    let sourceShape: CuiElement | undefined;
    let sourceParent: CuiElement | null = null;

    const removeShape = (shapes: CuiElement[], parent: CuiElement | null = null): CuiElement[] => {
      return shapes.reduce((acc, shape) => {
        if (shape.id === sourceId) {
          sourceShape = { ...shape };
          sourceParent = parent;
          return acc;
        }
        const newShape = { ...shape, children: removeShape(shape.children, shape) };
        return shape.id === sourceId ? acc : [...acc, newShape];
      }, [] as CuiElement[]);
    };

    const updatedShapes = removeShape(shapes);

    if (targetId === 'root') {
      return [...updatedShapes, sourceShape!];
    }

    const addShape = (shapes: CuiElement[]): CuiElement[] => {
      return shapes.map((shape) => {
        if (shape.id === targetId) {
          return { ...shape, children: [...shape.children, sourceShape!] };
        }
        return { ...shape, children: addShape(shape.children) };
      });
    };

    return addShape(updatedShapes);
  }, []);

  const moveToRoot = useCallback((shapeId: number) => {
    setShapes((prevShapes) => moveShape(prevShapes, shapeId, 'root'));
  }, [moveShape]);

  return (
    <Container fluid className="bg-light p-4">
      <Row>
        <Col xs={3}>
          <div className="d-flex flex-column">
            <EditorControls
              editorSize={editorSize}
              setEditorSize={setEditorSize}
              addShape={addShape}
            />
            <ShapeHierarchy
              shapes={shapes}
              handleDragOver={handleDragOver}
              handleDrop={handleDrop}
              handleDragStart={handleDragStart}
              toggleVisibility={toggleVisibility}
              toggleCollapse={toggleCollapse}
              handleProfileChange={handleProfileChange}
              moveToRoot={moveToRoot}
              draggingItem={draggingItem}
            />
          </div>
        </Col>
        <Col xs={9}>
          <EditorCanvas
            editorSize={editorSize}
            shapes={shapes}
            selectedShape={selectedShape}
            onShapesChange={handleShapeChange}
            // setIsDragging={setIsDragging}
            // setDragStart={setDragStart}
            setSelectedShape={setSelectedShape}
          />
        </Col>
      </Row>
    </Container>
  );
};

export default GraphicEditor;
