import React, { useEffect, useReducer } from 'react';
import { ChevronRight, ChevronDown, Eye, EyeOff, ArrowUp } from 'lucide-react';
import CuiElementModel from '../models/CuiElementModel';
import { Button, Card, ListGroup, ListGroupItem, Collapse } from 'react-bootstrap';
import ElementProfile from './ElementProfile';
import GraphicEditorModel from '@/models/GraphicEditorModel';

interface ShapeHierarchyProps {
  graphicEditor: GraphicEditorModel;
  handleDragOver: (e: React.DragEvent) => void;
  handleDrop: (e: React.DragEvent, targetId: number | 'root') => void;
  handleDragStart: (e: React.DragEvent, shapeId: number) => void;
  toggleVisibility: (shapeId: number) => void;
  toggleCollapse: (shapeId: number) => void;
  moveToRoot: (shapeId: number) => void;
  handleProfileChange: (shapeId: number, key: keyof CuiElementModel, value: any) => void;
  draggingItem: number | null;
  setSelectedShape: (shapeId: number | null) => void;
}

type State = CuiElementModel[];
type Action = { type: 'UPDATE_CHILDREN'; payload: CuiElementModel[] };

const childrenReducer = (state: State, action: Action): State => {
  switch (action.type) {
    case 'UPDATE_CHILDREN':
      return action.payload;
    default:
      return state;
  }
};

const ShapeHierarchy: React.FC<ShapeHierarchyProps> = ({
  graphicEditor,
  handleDragOver,
  handleDrop,
  handleDragStart,
  toggleVisibility,
  toggleCollapse,
  moveToRoot,
  handleProfileChange,
  draggingItem,
  setSelectedShape,
}) => {
  const [, dispatch] = useReducer(childrenReducer, graphicEditor.children);

  useEffect(() => {
    const updateChildren = () => {
      console.log('Children updated');
      dispatch({ type: 'UPDATE_CHILDREN', payload: graphicEditor.children });
    };

    graphicEditor.subscribe(updateChildren);
    return () => {
      graphicEditor.unsubscribe(updateChildren);
    };
  }, [graphicEditor]);

  const handleSelectShape = (shape: CuiElementModel) => {
    setSelectedShape(shape.id);
  };

  const handleAddChild = () => {
    // Логика для добавления дочернего элемента
  };

  const handleToggleFill = () => {
    // Логика для переключения fill режима
  };

  const renderHierarchy = (items: CuiElementModel[], level = 0) => {
    return items.map(shape => (
      <li key={shape.id} style={{ listStyleType: 'none' }}>
        <ListGroupItem 
          style={{ paddingLeft: `${level * 20}px`, border: '1px solid #ddd', marginBottom: '5px', backgroundColor: shape.selected ? 'lightblue' : 'white' }} 
          className={`d-flex align-items-center p-1 ${draggingItem === shape.id ? 'bg-light' : ''}`}
          draggable
          onDragStart={(e) => handleDragStart(e, shape.id)}
          onDragOver={handleDragOver}
          onDrop={(e) => handleDrop(e, shape.id)}
          onClick={() => handleSelectShape(shape)}
        >
          {shape.children.length > 0 && (
            <Button variant="link" size="sm" onClick={(e) => { e.stopPropagation(); toggleCollapse(shape.id); }} className="mr-2 p-0">
              {shape.collapsed ? <ChevronRight size={12} /> : <ChevronDown size={12} />}
            </Button>
          )}
          <Button variant="link" size="sm" onClick={(e) => { e.stopPropagation(); toggleVisibility(shape.id); }} className="mr-2 p-0">
            {shape.visible ? <Eye size={12} /> : <EyeOff size={12} />}
          </Button>
          <span className="mr-2">{shape.type} - {shape.id}</span>
          <Button variant="link" size="sm" onClick={(e) => { e.stopPropagation(); moveToRoot(shape.id); }} className="ml-auto p-0">
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
              onChange={(key: keyof CuiElementModel, value: any) => handleProfileChange(shape.id, key, value)}
              onAddChild={handleAddChild}
              onToggleFill={handleToggleFill}
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
          onDragOver={handleDragOver}
          onDrop={(e) => handleDrop(e, 'root')}
          className="border border-dashed border-secondary p-2 mb-2"
          style={{ minHeight: '50px' }}
        >
          Root Level (Drop here to remove from parent)
        </div>
        <ListGroup>
          <ul style={{ paddingLeft: '0' }}>
            {renderHierarchy(graphicEditor.children)}
          </ul>
        </ListGroup>
      </Card.Body>
    </Card>
  );
};

export default ShapeHierarchy;
