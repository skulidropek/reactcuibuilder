import { makeAutoObservable } from "mobx";
import GraphicEditorStore from "./components/Editor/GraphicEditorStore";
import CuiElementModel from "./models/CuiElement/CuiElementModel";
import CuiElementParceModel from "./models/Parce/CuiElementParceModel";
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
  newProjectName: string = "";
  alertVisible: boolean = false;

  constructor() {
    makeAutoObservable(this);
    this.loadProjects();
  }

  setProjectName = (name: string) => {
    this.newProjectName = name;
    this.alertVisible = !name.trim(); // Автоматически показываем или скрываем alert
  }

  createProject = () => {
    if (!this.newProjectName.trim()) {
      this.alertVisible = true;
    } else {
      const newGraphicEditorStore = new GraphicEditorStore({ width: 1282, height: 722 }, []);
      const newProject: Project = {
        id: Date.now(),
        name: this.newProjectName,
        graphicEditorStore: newGraphicEditorStore,
      };
      this.projects.push(newProject);
      this.saveProjects();
      this.newProjectName = ""; // Очистка поля после создания проекта
      this.alertVisible = false;
    }
  }

  loadProjects = () => {
    const savedProjects = JSON.parse(localStorage.getItem("projects") || "[]");
    this.projects = savedProjects.map((project: any) => {
      let graphicEditorStore = new GraphicEditorStore(project.size, []);
      graphicEditorStore.backgroundImageUrl = project.backgroundImageUrl;
      graphicEditorStore = this.fromJSON(graphicEditorStore, project.children);
      return { ...project, graphicEditorStore: graphicEditorStore };
    });
  }

  fromJSON = (graphicEditorStore: GraphicEditorStore, data: CuiElementParceModel[]) => {
    data.forEach(item => {
      const element = this.createElement(item);
      if (element) {
        graphicEditorStore.pushChild(element);
        item.components.forEach(component => {
          element.updateComponentText(component.type, component);
        });
        if (item.parent !== 'Overlay') {
          graphicEditorStore.getParentOrChildById(Number(item.parent))?.pushChild(element);
        }
      }
    });
    return graphicEditorStore;
  }

  createElement = (item: CuiElementParceModel) => {
    switch (item.type) {
      case 'CuiPanel': return new CuiPanelModel(Number(item.name));
      case 'CuiLabel': return new CuiLabelModel(Number(item.name));
      case 'CuiButton': return new CuiButtonModel(Number(item.name));
      default: return new CuiElementModel(item.type, [], Number(item.name));
    }
  }

  saveProjects = () => {
    const projectsToSave = this.projects.map(({ graphicEditorStore, ...project }) => ({
      ...project,
      size: graphicEditorStore.size,
      backgroundImageUrl: graphicEditorStore.backgroundImageUrl,
      children: graphicEditorStore.toRustFormat(),
    }));
    localStorage.setItem("projects", JSON.stringify(projectsToSave));
  }

  loadProject = (id: number) => {
    this.currentProject = this.projects.find(p => p.id === id) || null;
  }

  deleteProject = (id: number) => {
    this.projects = this.projects.filter(p => p.id !== id);
    this.saveProjects();
    if (this.currentProject && this.currentProject.id === id) {
      this.currentProject = null;
    }
  }
}

const projectStore = new ProjectStore();
export default projectStore;
