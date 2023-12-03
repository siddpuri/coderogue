import { useEffect, useState, useRef } from 'react';
import Button from 'react-bootstrap/Button';
import Editor, { Monaco } from '@monaco-editor/react';
import { editor, languages, KeyMod, KeyCode } from 'monaco-editor';

import { useAppSelector, useAppDispatch } from '../client/redux_hooks';
import { keyBindings } from '../client/key_bindings';

import { useLoadCodeQuery, useSubmitCodeMutation, useRespawnMutation } from '../state/server_api';
import { alertSlice } from '../state/alert_state';

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

export default function CodeTab() {
    const isLoggedIn = useAppSelector(state => state.login?.credentials?.playerId ?? null);
    const serverCode = useLoadCodeQuery(undefined, { skip: !isLoggedIn })?.data;
    const [respawn] = useRespawnMutation();
    const [submitCode] = useSubmitCodeMutation();
    const dispatch = useAppDispatch();

    const editorRef = useRef<editor.IStandaloneCodeEditor>();
    const [code, setCode] = useState<string>(serverCode ?? '');

    useEffect(bindKeys);
    if (serverCode && !code) setCode(serverCode);

    return <>
        <div className="row">
            <div className="col">
                <Editor
                    height="80vh"
                    language="javascript"
                    value={code}
                    onMount={onMount}
                    onChange={code => setCode(code ?? '')}
                />
            </div>
            <div className="col-2">
                <div className="d-grid gap-2">
                    <Button variant="secondary" onClick={() => respawn()}>Respawn</Button>
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
        editorRef.current = editorInstance;

        let defaults = monaco.languages.typescript.javascriptDefaults;
        defaults.setDiagnosticsOptions(diagnosticsOptions);
        defaults.setCompilerOptions(compilerOptions);
        defaults.addExtraLib(types);
        editorInstance.updateOptions(editorOptions);

        for (let key in keyBindings) {
            let keyCode = key.split('-').reduce((a, k) => a | keyCodes[k], 0);
            editorInstance.addCommand(keyCode, () => keyBindings[key]());
        }
    }

    function reformat(): void {
        editorRef.current?.getAction('editor.action.formatDocument')?.run();
    }

    function submit(): void {
        submitCode(code)
            .unwrap()
            .then(() => dispatch(alertSlice.actions.showSuccess('Code submitted')))
            .catch(err => dispatch(alertSlice.actions.showError(err)));
    }
}
