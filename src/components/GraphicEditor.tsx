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
    const newShape = new CuiElement(
      Date.now(), // id
      type, // type
      true, // visible
      [], // children
      [
        new CuiRectTransformModel(
          "0.1 0.1",
          "0.2 0.2",
          "10 10",
          "-10 -10"
        )
      ], // components
      false, // collapsed
      null, // parent (корневой элемент не имеет родителя)
      false // selected
    );
    setShapes((prevShapes) => [...prevShapes, newShape]);
  }, []);

  const handleShapeChange = useCallback((updatedShapes: CuiElement[]) => {
    setShapes(updatedShapes);
  }, []);

  const handleProfileChange = useCallback((shapeId: number, key: keyof CuiElement, value: any) => {
    setShapes((prevShapes) => 
      prevShapes.map(shape => 
        shape.id === shapeId ? new CuiElement(
          shape.id,
          shape.type,
          key === 'visible' ? value : shape.visible,
          shape.children,
          key === 'components' ? value : shape.components,
          key === 'collapsed' ? value : shape.collapsed,
          shape.parent, // добавляем parent
          key === 'selected' ? value : shape.selected // добавляем selected
        ) : shape
      )
    );
  }, []);
  
  const toggleVisibility = useCallback((shapeId: number) => {
    const toggleShapeVisibility = (shapes: CuiElement[], id: number): CuiElement[] => {
      return shapes.map((shape) => {
        if (shape.id === id) {
          return new CuiElement(
            shape.id,
            shape.type,
            !shape.visible,
            shape.children.map(child => new CuiElement(child.id, child.type, child.visible, child.children, child.components, child.collapsed, shape, child.selected)),
            shape.components,
            shape.collapsed,
            shape.parent,
            shape.selected
          );
        } else if (shape.children.length > 0) {
          return new CuiElement(
            shape.id,
            shape.type,
            shape.visible,
            toggleShapeVisibility(shape.children, id),
            shape.components,
            shape.collapsed,
            shape.parent,
            shape.selected
          );
        }
        return new CuiElement(
          shape.id,
          shape.type,
          shape.visible,
          shape.children.map(child => new CuiElement(child.id, child.type, child.visible, child.children, child.components, child.collapsed, shape, child.selected)),
          shape.components,
          shape.collapsed,
          shape.parent,
          shape.selected
        );
      });
    };
  
    setShapes((prevShapes) => toggleShapeVisibility(prevShapes, shapeId));
  }, []);

  const toggleShapeVisibility = useCallback((shapes: CuiElement[], id: number): CuiElement[] => {
    return shapes.map((shape) => {
      if (shape.id === id) {
        return new CuiElement(
          shape.id,
          shape.type,
          !shape.visible,
          shape.children.map(child => new CuiElement(child.id, child.type, child.visible, child.children, child.components, child.collapsed, shape, child.selected)),
          shape.components,
          shape.collapsed,
          shape.parent,
          shape.selected
        );
      } else if (shape.children.length > 0) {
        return new CuiElement(
          shape.id,
          shape.type,
          shape.visible,
          toggleShapeVisibility(shape.children, id),
          shape.components,
          shape.collapsed,
          shape.parent,
          shape.selected
        );
      }
      return new CuiElement(
        shape.id,
        shape.type,
        shape.visible,
        shape.children.map(child => new CuiElement(child.id, child.type, child.visible, child.children, child.components, child.collapsed, shape, child.selected)),
        shape.components,
        shape.collapsed,
        shape.parent,
        shape.selected
      );
    });
  }, []);

  const toggleShapeCollapse = useCallback((shapes: CuiElement[], id: number): CuiElement[] => {
    return shapes.map((shape) => {
      if (shape.id === id) {
        return new CuiElement(
          shape.id,
          shape.type,
          shape.visible,
          shape.children.map(child => new CuiElement(child.id, child.type, child.visible, child.children, child.components, child.collapsed, shape, child.selected)),
          shape.components,
          !shape.collapsed,
          shape.parent,
          shape.selected
        );
      } else if (shape.children.length > 0) {
        return new CuiElement(
          shape.id,
          shape.type,
          shape.visible,
          toggleShapeCollapse(shape.children, id),
          shape.components,
          shape.collapsed,
          shape.parent,
          shape.selected
        );
      }
      return new CuiElement(
        shape.id,
        shape.type,
        shape.visible,
        shape.children.map(child => new CuiElement(child.id, child.type, child.visible, child.children, child.components, child.collapsed, shape, child.selected)),
        shape.components,
        shape.collapsed,
        shape.parent,
        shape.selected
      );
    });
  }, []);

  const toggleCollapse = useCallback((shapeId: number) => {
    setShapes((prevShapes) => {
      return prevShapes.map((shape) => {
        if (shape.id === shapeId) {
          return new CuiElement(
            shape.id,
            shape.type,
            shape.visible,
            shape.children.map(child => new CuiElement(child.id, child.type, child.visible, child.children, child.components, child.collapsed, shape, child.selected)),
            shape.components,
            !shape.collapsed,
            shape.parent,
            shape.selected
          );
        } else if (shape.children.length > 0) {
          return new CuiElement(
            shape.id,
            shape.type,
            shape.visible,
            toggleShapeCollapse(shape.children, shapeId),
            shape.components,
            shape.collapsed,
            shape.parent,
            shape.selected
          );
        }
        return new CuiElement(
          shape.id,
          shape.type,
          shape.visible,
          shape.children.map(child => new CuiElement(child.id, child.type, child.visible, child.children, child.components, child.collapsed, shape, child.selected)),
          shape.components,
          shape.collapsed,
          shape.parent,
          shape.selected
        );
      });
    });
  }, [toggleShapeCollapse]);

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
          sourceShape = new CuiElement(shape.id, shape.type, shape.visible, shape.children, shape.components, shape.collapsed, parent, shape.selected);
          sourceParent = parent;
          return acc;
        }
        const newShape = new CuiElement(
          shape.id,
          shape.type,
          shape.visible,
          removeShape(shape.children, shape),
          shape.components,
          shape.collapsed,
          shape.parent,
          shape.selected
        );
        return shape.id === sourceId ? acc : [...acc, newShape];
      }, [] as CuiElement[]);
    };

    const updatedShapes = removeShape(shapes);

    if (targetId === 'root') {
      if (sourceShape) {
        sourceShape.parent = null; // Обновляем родителя на null при перемещении в root
      }
      return [...updatedShapes, sourceShape!];
    }

    const addShape = (shapes: CuiElement[]): CuiElement[] => {
      return shapes.map((shape) => {
        if (shape.id === targetId) {
          if (sourceShape) {
            sourceShape.parent = shape; // Обновляем родителя при перемещении
          }
          return new CuiElement(
            shape.id,
            shape.type,
            shape.visible,
            [...shape.children, sourceShape!],
            shape.components,
            shape.collapsed,
            shape.parent,
            shape.selected
          );
        }
        return new CuiElement(
          shape.id,
          shape.type,
          shape.visible,
          addShape(shape.children),
          shape.components,
          shape.collapsed,
          shape.parent,
          shape.selected
        );
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
              selectedShape={selectedShape}
              setSelectedShape={setSelectedShape}
            />
          </div>
        </Col>
        <Col xs={9}>
          <EditorCanvas
            editorSize={editorSize}
            shapes={shapes}
            selectedShape={selectedShape}
            onShapesChange={handleShapeChange}
            setSelectedShape={setSelectedShape}
          />
        </Col>
      </Row>
    </Container>
  );
};

export default GraphicEditor;
