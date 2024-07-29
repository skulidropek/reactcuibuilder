import React, { useCallback } from 'react';
import { ChevronRight, ChevronDown, Eye, EyeOff, ArrowUp } from 'lucide-react';
import { Button, Card, ListGroup, ListGroupItem, Collapse } from 'react-bootstrap';
import CuiElementModel from '../../models/CuiElement/CuiElementModel';
import ElementProfile from '../ElementProfile';
import GraphicEditorStore from './GraphicEditorStore';
import { observer } from 'mobx-react-lite';

interface ShapeHierarchyProps {
  store: GraphicEditorStore;
}

const ShapeHierarchy: React.FC<ShapeHierarchyProps> = ({
  store,
}) => {

  const moveToParent = useCallback((sourceId: number, parentId: number) => {
    const sourceElement = store.getParentOrChildById(sourceId);
    const targetElement = store.getParentOrChildById(parentId);

    if (sourceElement) {
      if (targetElement) {
        targetElement.pushChild(sourceElement);
      } else {
        store.pushChild(sourceElement);
      }
    }

    store.desetDragging();
  }, [store]);

  const renderHierarchy = (items: CuiElementModel[], level = 0) => {
    return items.map(shape => (
      <li key={shape.id} style={{ listStyleType: 'none' }}>
        <ListGroupItem 
          style={{ paddingLeft: `${level * 20}px`, border: '1px solid #ddd', marginBottom: '5px', backgroundColor: shape.selected ? 'lightblue' : 'white' }} 
          className={`d-flex align-items-center p-1 ${store.draggingItem?.element?.id === shape.id ? 'bg-light' : ''}`}
          draggable
          onDragStart={(e) => {
            store.setDragging( { element: shape, startX: e.clientX, startY: e.clientY } );
            e.dataTransfer.setData("shapeId", shape.id.toString());
          }}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            const draggedId = parseInt(e.dataTransfer.getData("shapeId"));
            moveToParent(draggedId, shape.id);
          }}
          onClick={() => store.setSelected(shape)}
        >
          {shape.children.length > 0 && (
            <Button variant="link" size="sm" onClick={(e) => { e.stopPropagation(); shape.collapsed = !shape.collapsed; }} className="mr-2 p-0">
              {shape.collapsed ? <ChevronRight size={12} /> : <ChevronDown size={12} />}
            </Button>
          )}
          <Button variant="link" size="sm" onClick={(e) => { e.stopPropagation(); shape.visible = !shape.visible; }} className="mr-2 p-0">
            {shape.visible ? <Eye size={12} /> : <EyeOff size={12} />}
          </Button>
          <span className="mr-2">{shape.type} - {shape.id}</span>
          <Button variant="link" size="sm" onClick={(e) => { e.stopPropagation(); moveToParent(shape.id, store.id); }} className="ml-auto p-0">
            <ArrowUp size={12} />
          </Button>
        </ListGroupItem>
        {!shape.collapsed && shape.children.length > 0 && (
          <ul>
            {renderHierarchy(shape.children, level + 1)}
          </ul>
        )}
        {shape.selected && (
          <Collapse in={shape.selected}>
            <ElementProfile
              key={shape.id}
              element={shape}
            />
          </Collapse>
        )}
      </li>
    ));
  };

  return (
    <Card className="w-100 h-100 overflow-auto">
      <Card.Header>
        <h5>Hierarchy</h5>
      </Card.Header>
      <Card.Body>
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            const draggedId = parseInt(e.dataTransfer.getData("shapeId"));
            moveToParent(draggedId, store.id);
          }}
          className="border border-dashed border-secondary p-2 mb-2"
          style={{ minHeight: '50px' }}
        >
          Root Level (Drop here to remove from parent)
        </div>
        <ListGroup>
          <ul style={{ paddingLeft: '0' }}>
            {renderHierarchy(store.children)}
          </ul>
        </ListGroup>
      </Card.Body>
    </Card>
  );
};

export default observer(ShapeHierarchy);
