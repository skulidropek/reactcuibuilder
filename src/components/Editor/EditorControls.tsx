import React from 'react';
import { FaPlus } from 'react-icons/fa';
import { Button, Form } from 'react-bootstrap';
import { observer } from 'mobx-react-lite';
import GraphicEditorStore from './GraphicEditorStore';
import CuiElementModel from '../../models/CuiElementModel';
import CuiButtonComponentModel from '../../models/CuiButtonComponentModel';
import TreeNodeModel from '../../models/TreeNodeModel';

interface EditorControlsProps {
  store: GraphicEditorStore;
}

const plugin = `using System.Collections.Generic;
using Oxide.Core.Plugins;
using Oxide.Game.Rust.Cui;
using UnityEngine;

namespace Oxide.Plugins
{
    [Info("CuiPlugin", "https://discord.gg/jM3DPA5VSv", "1.0.0")]
    [Description("A simple GUI example for Rust.")]
    public class CuiPlugin : RustPlugin
    {
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

    const data = plugin.replace("%COMMANDS%", commandText).replace("%CONTAINER_ELEMENTS%", store.children.map(s => s.ToCode()).join(',\n'));
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
      <Form.Group controlId="editorWidth" className="mb-3">
        <Form.Label>Width:</Form.Label>
        <Form.Control
          type="number"
          value={store.size.width}
          onChange={(e) => store.size = {...store.size, width: Number(e.target.value)}}
        />
      </Form.Group>
      <Form.Group controlId="editorHeight" className="mb-3">
        <Form.Label>Height:</Form.Label>
        <Form.Control
          type="number"
          value={store.size.height}
          onChange={(e) => store.size = {...store.size, height: Number(e.target.value)}}
        />
      </Form.Group>
      <div className="d-flex justify-content-between">
        <Button variant="primary" onClick={() => store.pushNewElement('CuiPanel')} className="mr-2 mb-2">
          <FaPlus className="mr-2" /> CuiPanel
        </Button>
        <Button variant="primary" onClick={() => store.pushNewElement('CuiButton')} className="mr-2 mb-2">
          <FaPlus className="mr-2" /> CuiButton
        </Button>
        {/* <Button variant="primary" onClick={() => store.pushNewElement('circle')} className="mr-2 mb-2">
          <FaPlus className="mr-2" /> Circle
        </Button> */}
        <Button variant="secondary" onClick={exportToPlugin} className="mb-2">
          Export to C#
        </Button>
      </div>
    </div>
  );
};

export default observer(EditorControls);
