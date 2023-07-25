import React from 'react';
import Editor, { Monaco } from '@monaco-editor/react';
import { editor, KeyMod, KeyCode } from 'monaco-editor';

import types from '../assets/coderogue.d.ts?raw';

const keyCodes: { [key: string]: KeyCode } = {
    'C': KeyMod.CtrlCmd,
    'S': KeyMod.Shift,
    's': KeyCode.KeyS,
    '[': KeyCode.BracketLeft,
    ']': KeyCode.BracketRight,
    'ArrowUp': KeyCode.UpArrow,
    'ArrowDown': KeyCode.DownArrow,
};

export default class CodeTab extends React.Component {
    editor!: editor.IStandaloneCodeEditor;

    render() { return (<>
        <div className="col-10">
            <Editor
                height="80vh"
                language="javascript"
                onMount={this.onEditorMount.bind(this)}
                defaultValue="console.log('Hi');"
            />
        </div>
        <div className="col">
            <div className="d-grid gap-2">
                <button type="button" className="btn btn-secondary" id="respawn1">Respawn</button>
                <button type="button" className="btn btn-secondary" id="reformat">Reformat</button>
                <button type="button" className="btn btn-primary" id="submit">Submit</button>
            </div>
        </div>
    </>);}

    async onEditorMount(editor: editor.IStandaloneCodeEditor, monaco: Monaco) {
        this.editor = editor;

        monaco.languages.typescript.javascriptDefaults.setDiagnosticsOptions({
            noSemanticValidation: false,
            noSuggestionDiagnostics: true,
            noSyntaxValidation: false,
        });

        monaco.languages.typescript.javascriptDefaults.setCompilerOptions({
            target: monaco.languages.typescript.ScriptTarget.ES2017,
            allowNonTsExtensions: true,
            lib: ['es2017'],
        });

        monaco.languages.typescript.javascriptDefaults.addExtraLib(types);

        editor.updateOptions({
            acceptSuggestionOnCommitCharacter: false,
            acceptSuggestionOnEnter: 'off',
            automaticLayout: true,
            fixedOverflowWidgets: true,
            fontSize: 12,
            formatOnType: true,
            formatOnPaste: true,
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
        });
    }

    addKeybindings(keybindings: { [key: string]: () => void }) {
        for (let key in keybindings) {
            let keyCode = key.split('-').reduce((a, k) => a | keyCodes[k], 0);
            this.editor.addCommand(keyCode, keybindings[key]);
        }
    }

    get code() { return this.editor.getValue(); }
    set code(code) { this.editor.setValue(code); }

    reformat(): void {
        this.editor.getAction('editor.action.formatDocument')?.run();
    }
}
