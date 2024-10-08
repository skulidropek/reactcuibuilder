import logo from './logo.svg';
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import GraphicEditor from './components/Editor/GraphicEditor';
import GraphicEditorStore from './components/Editor/GraphicEditorStore';
import ProjectManager from './ProjectManager';

function App() {
  return (
    <ProjectManager />
    // <GraphicEditor store={new GraphicEditorStore({ width: 1282, height: 722 }, [])} />

    // <div className="App">
    //   <header className="App-header">
    //     <img src={logo} className="App-logo" alt="logo" />
    //     <p>
    //       Edit <code>src/App.js</code> and save to reload.
    //     </p>
    //     <a
    //       className="App-link"
    //       href="https://reactjs.org"
    //       target="_blank"
    //       rel="noopener noreferrer"
    //     >
    //       Learn React
    //     </a>
    //   </header>
    // </div>
  );
}

export default App;
