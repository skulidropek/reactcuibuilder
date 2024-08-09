import React, { useState, useEffect } from "react";
import { observer } from "mobx-react-lite";
import projectStore from "./ProjectStore"; // Убедитесь, что путь правильный
import GraphicEditor from "./components/Editor/GraphicEditor"; // Убедитесь, что путь правильный

const ProjectManager: React.FC = observer(() => {
  const [newProjectName, setNewProjectName] = useState<string>("");

  const {
    projects,
    currentProject,
    createProject,
    loadProject,
    deleteProject,
    saveProjects,
  } = projectStore;

  // Состояние для управления режимом просмотра
  const [isProjectView, setIsProjectView] = useState<boolean>(true);

  const handleCreateProject = () => {
    if (newProjectName.trim()) {
      createProject(newProjectName);
      setNewProjectName("");
    }
  };

  const handleLoadProject = (id: number) => {
    loadProject(id);
    setIsProjectView(false); // Переходим в режим редактирования проекта
  };

  const handleBackToProjects = () => {
    saveProjects(); // Сохраняем текущие изменения
    setIsProjectView(true); // Возвращаемся к списку проектов
    projectStore.currentProject = null; // Сбрасываем текущий проект
  };

  // Автосохранение при закрытии вкладки или обновлении страницы
  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (currentProject) {
        saveProjects();
        event.returnValue = "У вас есть несохраненные изменения, вы уверены, что хотите выйти?";
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [currentProject, saveProjects]);

  return (
    <div>
      <h2>Менеджер проектов</h2>

      {isProjectView ? (
        <div>
          <div>
            <input
              type="text"
              value={newProjectName}
              onChange={(e) => setNewProjectName(e.target.value)}
              placeholder="Название нового проекта"
            />
            <button onClick={handleCreateProject}>Создать проект</button>
          </div>

          <h3>Список проектов</h3>
          <ul>
            {projects.map((project) => (
              <li key={project.id}>
                {project.name}
                <button onClick={() => handleLoadProject(project.id)}>Загрузить</button>
                <button onClick={() => deleteProject(project.id)}>Удалить</button>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <div>
          <button onClick={handleBackToProjects}>Вернуться к списку проектов</button>
          {currentProject && (
            <div>
              <h3>Текущий проект: {currentProject.name}</h3>
              <GraphicEditor store={currentProject.graphicEditorStore} />
            </div>
          )}
        </div>
      )}
    </div>
  );
});

export default ProjectManager;
