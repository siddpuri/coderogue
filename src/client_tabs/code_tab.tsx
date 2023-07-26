import { useContext } from 'react';

import Editor, { Monaco } from '@monaco-editor/react';
import { editor, languages, KeyMod, KeyCode } from 'monaco-editor';

import * as Context from '../client/context';

import types from '../assets/coderogue.d.ts?raw';

export default function CodeTab() {
    const editorRef = useContext(Context.EditorRef);

    return (<>
        <div className="col-10">
            <Editor
                height="80vh"
                language="javascript"
                onMount={(e, m) => { editorRef.current = e; onEditorMount(e, m); }}
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
    </>);
}

const diagnosticsOptions: languages.typescript.DiagnosticsOptions = {
    noSemanticValidation: false,
    noSuggestionDiagnostics: true,
    noSyntaxValidation: false,
};

const compilerOptions: languages.typescript.CompilerOptions = {
    target: languages.typescript.ScriptTarget.ES2017,
    allowNonTsExtensions: true,
    lib: ['es2017'],
};

const editorOptions: editor.IEditorOptions = {
    acceptSuggestionOnCommitCharacter: false,
    acceptSuggestionOnEnter: 'off',
    automaticLayout: true,
    fixedOverflowWidgets: true,
    fontSize: 12,
    formatOnType: true,
    formatOnPaste: true,
    minimap: { enabled: false },
    scrollBeyondLastLine: false,
};

function onEditorMount(editor: editor.IStandaloneCodeEditor, monaco: Monaco) {
    let defaults = monaco.languages.typescript.javascriptDefaults;
    defaults.setDiagnosticsOptions(diagnosticsOptions);
    defaults.setCompilerOptions(compilerOptions);
    defaults.addExtraLib(types);
    editor.updateOptions(editorOptions);
}

const keyCodes: { [key: string]: KeyCode } = {
    'C': KeyMod.CtrlCmd,
    'S': KeyMod.Shift,
    's': KeyCode.KeyS,
    '[': KeyCode.BracketLeft,
    ']': KeyCode.BracketRight,
    'ArrowUp': KeyCode.UpArrow,
    'ArrowDown': KeyCode.DownArrow,
};

// export function addKeybindings(keybindings: { [key: string]: () => void }): void {
//     for (let key in keybindings) {
//         let keyCode = key.split('-').reduce((a, k) => a | keyCodes[k], 0);
//         EditorRef.current?.addCommand(keyCode, keybindings[key]);
//     }
// }

// export function getCode(): string { return EditorRef.current?.getValue() || ''; }
// export function setCode(code: string): void { EditorRef.current?.setValue(code); }

// export function reformat(): void {
//     EditorRef.current?.getAction('editor.action.formatDocument')?.run();
// }
