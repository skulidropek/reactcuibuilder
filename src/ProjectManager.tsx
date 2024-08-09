import React from "react";
import { observer } from "mobx-react-lite";
import projectStore from "./ProjectStore";
import GraphicEditor from "./components/Editor/GraphicEditor";

const ProjectManager: React.FC = observer(() => {
  const {
    projects,
    currentProject,
    createProject,
    loadProject,
    deleteProject,
    saveProjects,
    newProjectName,
    setProjectName,
    alertVisible
  } = projectStore;

  const handleCreateProject = () => {
    createProject();
  };

  const handleLoadProject = (id: number) => {
    loadProject(id);
  };

  const handleBackToProjects = () => {
    saveProjects();
    projectStore.currentProject = null;
  };

  return (
    <div className={currentProject ? "" : "container mt-5"}>
      <h2 className={currentProject ? "" : "mb-4"}>Менеджер проектов</h2>

      {alertVisible && (
        <div className="alert alert-warning" role="alert">
          Укажите название проекта
        </div>
      )}

      {!currentProject ? (
        <div>
          <div className="mb-3">
            <input
              type="text"
              className="form-control"
              value={newProjectName}
              onChange={(e) => setProjectName(e.target.value)}
              placeholder="Название нового проекта"
            />
            <button className="btn btn-primary mt-2" onClick={handleCreateProject}>
              Создать проект
            </button>
          </div>

          <h3 className="mb-3">Список проектов</h3>
          <ul className="list-group">
            {projects.map((project) => (
              <li key={project.id} className="list-group-item d-flex justify-content-between align-items-center">
                {project.name}
                <div>
                  <button className="btn btn-secondary btn-sm me-2" onClick={() => handleLoadProject(project.id)}>
                    Загрузить
                  </button>
                  <button className="btn btn-danger btn-sm" onClick={() => deleteProject(project.id)}>
                    Удалить
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <div>
          <button className="btn btn-secondary mb-3" onClick={handleBackToProjects}>
            Вернуться к списку проектов
          </button>
          <h3 className="mb-0">Текущий проект: {currentProject.name}</h3>
          <GraphicEditor store={currentProject.graphicEditorStore} />
        </div>
      )}
    </div>
  );
});

export default ProjectManager;
