import { useEffect, useState, useRef } from 'react';
import Button from 'react-bootstrap/Button';
import ButtonToolbar from 'react-bootstrap/ButtonToolbar';
import Form from 'react-bootstrap/Form';
import Editor, { Monaco } from '@monaco-editor/react';
import { editor, languages, KeyMod, KeyCode } from 'monaco-editor';

import { useAppSelector, useAppDispatch } from '../client/redux_hooks';
import { keyBindings } from '../client/key_bindings';

import {
    useLoadCodeQuery,
    useLoadLogQuery,
    useSubmitCodeMutation,
    useRespawnMutation
} from '../state/server_api';

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
    // automaticLayout: true,
    // fixedOverflowWidgets: true,
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
    const log = useLoadLogQuery(undefined, { skip: !isLoggedIn, pollingInterval: 1000 })?.data;
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
                <ButtonToolbar className="gap-2 mb-3">
                    <Button variant="secondary" onClick={() => respawn()}>Respawn</Button>
                    <Button variant="secondary" onClick={reformat}>Reformat</Button>
                    <Button variant="primary" onClick={submit}>Submit</Button>
                </ButtonToolbar>
                <Editor
                    language="javascript"
                    height="100vh"
                    value={code}
                    onMount={onMount}
                    onChange={code => setCode(code ?? '')}
                />
            </div>
            <div className="col-4">
                <ButtonToolbar className="gap-2 mb-3">
                    <Button variant="secondary" onClick={() => 0}>Clear</Button>
                    <Button variant="primary" onClick={() => 0}>Freeze</Button>
                </ButtonToolbar>
                <Form.Control
                    as="textarea"
                    plaintext
                    readOnly
                    style={{
                        fontFamily: 'monospace',
                        fontSize: '10px',
                        height: '100vh',
                        whiteSpace: 'pre',
                    }}
                    value={log}
                />
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
