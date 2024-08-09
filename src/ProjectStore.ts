import { makeAutoObservable } from "mobx";
import GraphicEditorStore from "./components/Editor/GraphicEditorStore"; // Ensure the path is correct
import CuiElementModel from "./models/CuiElement/CuiElementModel";
import CuiElementParceModel from "./models/Parce/CuiElementParceModel";
import { defaultAriaLiveMessages } from "react-select/dist/declarations/src/accessibility";
import CuiRectTransformModel from "./models/CuiComponent/CuiRectTransformModel";
import CuiNeedsCursorComponentModel from "./models/CuiComponent/CuiNeedsCursorComponentModel";
import CuiButtonComponentModel from "./models/CuiComponent/CuiButtonComponentModel";
import CuiPanelModel from "./models/CuiElement/CuiPanelModel";
import CuiLabelModel from "./models/CuiElement/CuiLabelModel";
import CuiButtonModel from "./models/CuiElement/CuiButtonModel";

interface Project {
  id: number;
  name: string;
  graphicEditorStore: GraphicEditorStore;
}

class ProjectStore {
  projects: Project[] = [];
  currentProject: Project | null = null;

  constructor() {
    makeAutoObservable(this);
    this.loadProjects();
  }

  loadProjects = () => {
    const savedProjects = JSON.parse(localStorage.getItem("projects") || "[]");

    console.log(savedProjects)

    this.projects = savedProjects.map((project: any) => { 
      
      const children = project.children as CuiElementParceModel[];

      let graphicEditorStore = new GraphicEditorStore(project.size, [])

      graphicEditorStore = this.fromJSON(graphicEditorStore, children)
      
      return ({
      ...project,
      graphicEditorStore: graphicEditorStore,
    })});
  }

  fromJSON(graphicEditorStore: GraphicEditorStore, data: CuiElementParceModel[]): GraphicEditorStore {
    data.forEach(item => {
      // Создание элемента на основе типа
      const element = this.createElement(item);
  
      if (element) {
        // Добавление элемента в store
        graphicEditorStore.pushChild(element);
  
        // Обновление компонентов
        item.components.forEach(component => {
          element.updateComponentText(component.type, component);
        });
  
        // Если элемент не Overlay, добавление в родителя
        if (item.parent !== 'Overlay') {
          graphicEditorStore.getParentOrChildById(Number(item.parent))?.pushChild(element);
        }
      }
    });
  
    return graphicEditorStore;
  }
  
  // Вспомогательная функция для создания элемента
  private createElement(item: CuiElementParceModel): CuiElementModel | undefined {
    switch (item.type) {
      case 'CuiPanel':
        return new CuiPanelModel(Number(item.name));
      case 'CuiLabel':
        return new CuiLabelModel(Number(item.name));
      case 'CuiButton':
        return new CuiButtonModel(Number(item.name));
      default:
        return new CuiElementModel(item.type, [], Number(item.name));
    }
  }

  saveProjects = () => {
    const projectsToSave = this.projects.map(({ graphicEditorStore, ...project }) => ({
      ...project,
      size: graphicEditorStore.size,
      children: graphicEditorStore.toRustFormat(),
    }));
    
    localStorage.setItem("projects", JSON.stringify(projectsToSave));
  }

  createProject = (name: string) => {
    const size = { width: 1282, height: 722 };
    const newGraphicEditorStore = new GraphicEditorStore(size, []);
    const newProject: Project = {
      id: Date.now(),
      name,
      graphicEditorStore: newGraphicEditorStore,
    };
    this.projects.push(newProject);
    this.saveProjects();
  }

  loadProject = (id: number) => {
    this.currentProject = this.projects.find((p) => p.id === id) || null;
  }

  deleteProject = (id: number) => {
    this.projects = this.projects.filter((p) => p.id !== id);
    this.saveProjects();
    if (this.currentProject && this.currentProject.id === id) {
      this.currentProject = null;
    }
  }
}

const projectStore = new ProjectStore();
export default projectStore;
