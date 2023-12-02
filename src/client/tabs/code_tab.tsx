import { useAppSelector } from '../client/redux_hooks';

import { useLoadCodeQuery } from '../state/server_api';

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

export let editorRef: editor.IStandaloneCodeEditor | null = null;
let isCodeInitialized = false;

export default function CodeTab() {
    const isLoggedIn = useAppSelector(state => state.login?.credentials?.playerId ?? null);
    const code = useLoadCodeQuery(undefined, { skip: !isLoggedIn })?.data ?? null;
    initializeCode();

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

    function onMount(editorInstance: editor.IStandaloneCodeEditor, monaco: Monaco): void {
        editorRef = editorInstance;
        initializeCode();

        let defaults = monaco.languages.typescript.javascriptDefaults;
        defaults.setDiagnosticsOptions(diagnosticsOptions);
        defaults.setCompilerOptions(compilerOptions);
        defaults.addExtraLib(types);
        editorRef.updateOptions(editorOptions);
    }

    function reformat(): void {
        editorRef?.getAction('editor.action.formatDocument')?.run();
    }

    function initializeCode() {
        if (editorRef && code != null && !isCodeInitialized) {
            isCodeInitialized = true;
            editorRef.setValue(code);
        }
    }
}

export function addKeybindings(keybindings: { [key: string]: () => void }): void {
    for (let key in keybindings) {
        let keyCode = key.split('-').reduce((a, k) => a | keyCodes[k], 0);
        // editor?.addCommand(keyCode, keybindings[key]);
    }
}
