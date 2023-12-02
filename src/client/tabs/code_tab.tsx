import { useEffect } from 'react';
import { useAppSelector, useAppDispatch } from '../client/redux_hooks';
import { keyBindings } from '../client/key_bindings';

import { useLoadCodeQuery, useSubmitCodeMutation } from '../state/server_api';
import { alertSlice } from '../state/alert_state';

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
    'ArrowLeft': KeyCode.LeftArrow,
    'ArrowRight': KeyCode.RightArrow,
};

let editorRef: editor.IStandaloneCodeEditor | null = null;
let isCodeInitialized = false;

export default function CodeTab() {
    const isLoggedIn = useAppSelector(state => state.login?.credentials?.playerId ?? null);
    const code = useLoadCodeQuery(undefined, { skip: !isLoggedIn })?.data ?? null;
    const [submitCode] = useSubmitCodeMutation();
    const dispatch = useAppDispatch();

    useEffect(bindKeys);
    useEffect(initializeCode);

    return <>
        <div className="row">
            <div className="col">
                <Editor
                    height="80vh"
                    language="javascript"
                    onMount={onMount}
                />
            </div>
            <div className="col-2">
                <div className="d-grid gap-2">
                    <button type="button" className="btn btn-secondary">Respawn</button>
                    <Button variant="secondary" onClick={reformat}>Reformat</Button>
                    <Button variant="primary" onClick={submit}>Submit</Button>
                </div>
            </div>
        </div>
    </>;

    function bindKeys() {
        keyBindings['C-s'] = submit;
    }

    function onMount(editorInstance: editor.IStandaloneCodeEditor, monaco: Monaco): void {
        editorRef = editorInstance;
        initializeCode();

        let defaults = monaco.languages.typescript.javascriptDefaults;
        defaults.setDiagnosticsOptions(diagnosticsOptions);
        defaults.setCompilerOptions(compilerOptions);
        defaults.addExtraLib(types);
        editorRef.updateOptions(editorOptions);

        for (let key in keyBindings) {
            let keyCode = key.split('-').reduce((a, k) => a | keyCodes[k], 0);
            editorRef?.addCommand(keyCode, () => keyBindings[key]());
        }
    }

    function reformat(): void {
        editorRef?.getAction('editor.action.formatDocument')?.run();
    }

    function submit(): void {
        if (!editorRef) return;
        submitCode(editorRef.getValue())
            .unwrap()
            .then(() => dispatch(alertSlice.actions.showSuccess('Code submitted')))
            .catch(err => dispatch(alertSlice.actions.showError(err)));
    }

    function initializeCode() {
        if (editorRef && code != null && !isCodeInitialized) {
            isCodeInitialized = true;
            // editorRef!.setValue(code);
        }
    }
}
