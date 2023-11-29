import { useRef } from 'react';
import Button from 'react-bootstrap/Button';

import Editor, { Monaco } from '@monaco-editor/react';
import { editor, languages, KeyMod, KeyCode } from 'monaco-editor';

import types from '../assets/coderogue.d.ts?raw';

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

const keyCodes: { [key: string]: KeyCode } = {
    'C': KeyMod.CtrlCmd,
    'S': KeyMod.Shift,
    's': KeyCode.KeyS,
    '[': KeyCode.BracketLeft,
    ']': KeyCode.BracketRight,
    'ArrowUp': KeyCode.UpArrow,
    'ArrowDown': KeyCode.DownArrow,
};

export default function CodeTab() {
    const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);

    return <>
        <div className="col-10">
            <Editor
                height="80vh"
                language="javascript"
                onMount={onMount}
            />
        </div>
        <div className="col">
            <div className="d-grid gap-2">
                <button type="button" className="btn btn-secondary" id="respawn1">Respawn</button>
                <Button variant="secondary" onClick={reformat}>Reformat</Button>
                <button type="button" className="btn btn-primary" id="submit">Submit</button>
            </div>
        </div>
    </>;

    function onMount(editor: editor.IStandaloneCodeEditor, monaco: Monaco) {
        editorRef.current = editor;

        let defaults = monaco.languages.typescript.javascriptDefaults;
        defaults.setDiagnosticsOptions(diagnosticsOptions);
        defaults.setCompilerOptions(compilerOptions);
        defaults.addExtraLib(types);
        editor.updateOptions(editorOptions);

        // codeAccessor.current = {
        //     getCode: () => editor.getValue(),
        //     setCode: (code: string) => editor.setValue(code),
        // };
    }

    function reformat(): void {
        editorRef.current?.getAction('editor.action.formatDocument')?.run();
    }
}

export function addKeybindings(keybindings: { [key: string]: () => void }): void {
    let EditorRef = { current: null as editor.IStandaloneCodeEditor | null};
    for (let key in keybindings) {
        let keyCode = key.split('-').reduce((a, k) => a | keyCodes[k], 0);
        EditorRef.current?.addCommand(keyCode, keybindings[key]);
    }
}
