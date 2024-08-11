import React from 'react';
import { FaPlus } from 'react-icons/fa';
import { Button, Form } from 'react-bootstrap';
import { observer } from 'mobx-react-lite';
import GraphicEditorStore from './GraphicEditorStore';
import CuiElementModel from '../../models/CuiElement/CuiElementModel';
import CuiButtonComponentModel from '../../models/CuiComponent/CuiButtonComponentModel';
import TreeNodeModel from '../../models/CuiElement/TreeNodeModel';
import CuiPanelModel from '../../models/CuiElement/CuiPanelModel';
import CuiButtonModel from '../../models/CuiElement/CuiButtonModel';
import CuiLabelModel from '../../models/CuiElement/CuiLabelModel';
import CuiImageComponentModel from '../../models/CuiComponent/CuiImageComponentModel';

interface EditorControlsProps {
  store: GraphicEditorStore;
}

const plugin = `using System.Collections.Generic;
using UnityEngine.UI;
using System;
using Oxide.Core.Plugins;
using Oxide.Game.Rust.Cui;
using UnityEngine;
using Oxide.Core.Plugins;

namespace Oxide.Plugins
{
    [Info("CuiPlugin", "https://discord.gg/jM3DPA5VSv", "1.0.0")]
    [Description("A simple GUI example for Rust.")]
    public class CuiPlugin : RustPlugin
    {
        private void OnServerInitialized()
        {
            new ImageLibrary(plugins.Find("ImageLibrary"));
            %IMAGES%
        }

        [ChatCommand("showgui")]
        private void ShowGuiCommand(BasePlayer player, string command, string[] args)
        {
            CreateGui(player);
        }

        %COMMANDS%

        private void CreateGui(BasePlayer player)
        {
            var container = new CuiElementContainer();

            %CONTAINER_ELEMENTS%

            CuiHelper.AddUi(player, container);
        }

        private class ImageLibrary : PluginSigleton<ImageLibrary>
        {
            public ImageLibrary(Plugin plugin) : base(plugin)
            {
                if (plugin == null)
                    throw new Exception("[CuiPlugin] Need add ImageLibrary");
            }

            public string GetImage(string shortname, ulong skin = 0) =>
                Plugin.Call<string>("GetImage", shortname, skin);

            public bool AddImage(string url, string shortname, ulong skin = 0) =>
                Plugin.Call<bool>("AddImage", url, shortname, skin);

            public bool HasImage(string imageName, ulong imageId = 0) => Plugin.Call<bool>("HasImage", imageName, imageId);
        }

        public abstract class PluginSigleton<T> : Sigleton<T> where T : PluginSigleton<T>
        {
            public Plugin Plugin { get; private set; }
            public PluginSigleton(Plugin plugin)
            {
                Plugin = plugin;
            }
        }

        public abstract class Sigleton<T> where T : Sigleton<T>
        {
            public static T Instance;

            public Sigleton()
            {
                Instance = (T)this;
            }
        }
    }
}
`;

const EditorControls: React.FC<EditorControlsProps> = ({ store }) => {

  const exportToPlugin = () => {
    const allCommands = store.map((s: TreeNodeModel) => {
          if (s instanceof CuiElementModel) {
              return s.findComponentByType(CuiButtonComponentModel);
          } else {
              console.warn('Element is not an instance of CuiElementModel:', s);
              return undefined;
          }
      }).filter(s => s != null && s != undefined).filter(s => s.command != null);


     const commandText = allCommands.map(s => `[ConsoleCommand("${s.command}")]
        void ${s.command}(ConsoleSystem.Arg arg)
        {
          var player = arg.Player();
          if (player == null) 
          { 
              Puts("Hello ${s.command}"); 
              return;
          }

          player.ConsoleMessage("Hello ${s.command}");
        }`).join('\n');

      const allImages = store.map((s: TreeNodeModel) => {
          if (s instanceof CuiElementModel) {
              return s.findComponentByType(CuiImageComponentModel);
          } else {
              console.warn('Element is not an instance of CuiElementModel:', s);
              return undefined;
          }
      }).filter(s => s != null && s != undefined).filter(s => s.png != null);

    const imagesText = allImages.map(s => `ImageLibrary.Instance.AddImage("${s.png}", "${s.png}");`).join('\n');

    const data = plugin.replace("%IMAGES%", imagesText).replace("%COMMANDS%", commandText).replace("%CONTAINER_ELEMENTS%", store.children.map(s => s.ToCode()).join('\n'));
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'CuiPlugin.cs';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-white p-4">
      {/* Существующий код */}
      <Form.Group controlId="github" className="mb-3">
        <Form.Label>
          <a
            href="https://github.com/skulidropek/reactcuibuilder"
            target="_blank"
            rel="noopener noreferrer"
          >
            Github
          </a>
        </Form.Label>
      </Form.Group>
      <Form.Group controlId="discord" className="mb-3">
        <Form.Label>
          <a
            href="https://discord.gg/jM3DPA5VSv"
            target="_blank"
            rel="noopener noreferrer"
          >
            Discord
          </a>
        </Form.Label>
      </Form.Group>
      <Form.Group controlId="disableAnchor" className="mb-3">
        <Form.Check
          type="checkbox"
          label="Disable Anchor"
          checked={store.disableAnchor}
          onChange={(e) => store.disableAnchor =  e.target.checked}
        />
      </Form.Group>
      <Form.Group controlId="disableOffset" className="mb-3">
        <Form.Check
          type="checkbox"
          label="Disable Offset"
          checked={store.disableOffset}
          onChange={(e) => store.disableOffset = e.target.checked}
        />
      </Form.Group>
      {/* Остальная часть формы */}
      <Form.Group controlId="editorWidth" className="mb-3">
        <Form.Label>Width:</Form.Label>
        <Form.Control
          type="number"
          value={store.size.width}
          onChange={(e) =>
            (store.size = { ...store.size, width: Number(e.target.value) })
          }
        />
      </Form.Group>
      <Form.Group controlId="editorHeight" className="mb-3">
        <Form.Label>Height:</Form.Label>
        <Form.Control
          type="number"
          value={store.size.height}
          onChange={(e) =>
            (store.size = { ...store.size, height: Number(e.target.value) })
          }
        />
      </Form.Group>
      <Form.Group
        controlId="buttons"
        className="d-flex flex-wrap justify-content-between flex-grow-1"
      >
        <Button
          variant="primary"
          onClick={() => store.pushChild(new CuiPanelModel())}
          className="mr-2 mb-2"
        >
          <FaPlus className="mr-2" /> CuiPanel
        </Button>
        <Button
          variant="primary"
          onClick={() => store.pushChild(new CuiButtonModel())}
          className="mr-2 mb-2"
        >
          <FaPlus className="mr-2" /> CuiButton
        </Button>
        <Button
          variant="primary"
          onClick={() => store.pushChild(new CuiLabelModel())}
          className="mr-2 mb-2"
        >
          <FaPlus className="mr-2" /> CuiLabel
        </Button>
        <Button variant="secondary" onClick={exportToPlugin} className="mb-2">
          Export to C#
        </Button>
      </Form.Group>
    </div>
  );
};

export default observer(EditorControls);
