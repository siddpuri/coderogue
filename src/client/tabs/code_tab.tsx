import { useEffect, useState, useRef } from 'react';
import { Button, ButtonToolbar, Form } from 'react-bootstrap';
import { editor, languages, KeyMod, KeyCode } from 'monaco-editor';
import Editor, { Monaco } from '@monaco-editor/react';

import { useAppSelector, useAppDispatch } from '../client/redux_hooks';
import { keyBindings } from '../client/key_bindings';

import {
    useLoadCodeQuery,
    useLoadLogQuery,
    useSubmitCodeMutation,
    useRespawnMutation
} from '../state/server_api';

import { alertSlice } from '../state/alert_state';

import Slider from '../components/slider';

import { LogResponse } from '../../shared/protocol';

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

const maxEntries = 100;

export default function CodeTab() {
    const isLoggedIn = useAppSelector(state => state.login?.credentials?.playerId ?? null);
    const serverCode = useLoadCodeQuery(undefined, { skip: !isLoggedIn })?.data;
    const serverLog = useLoadLogQuery(undefined, { skip: !isLoggedIn, pollingInterval: 1000 })?.data;
    const [respawn] = useRespawnMutation();
    const [submitCode] = useSubmitCodeMutation();
    const dispatch = useAppDispatch();

    const editorRef = useRef<editor.IStandaloneCodeEditor>();
    const [code, setCode] = useState<string>(serverCode ?? '');
    const [log, setLog] = useState<LogResponse>([]);

    useEffect(bindKeys);
    if (serverCode && !code) setCode(serverCode);
    if (Array.isArray(serverLog)) {
        let serverLogArray = serverLog as LogResponse;
        if (serverLogArray.length > 0) {
            if (serverLogArray[serverLogArray.length - 1] != log[log.length - 1]) {
                setLog(log.concat(serverLogArray).slice(-maxEntries));
            }
        }
    }

    let leftPane = <>
        <Form.Label><b>Your code</b></Form.Label>
        <ButtonToolbar className="gap-2 mb-3">
            <Button variant="secondary" onClick={() => respawn()}>Respawn</Button>
            <Button variant="secondary" onClick={reformat}>Reformat</Button>
            <Button variant="secondary" onClick={submit}>Submit</Button>
        </ButtonToolbar>
        <Editor
            language="javascript"
            height="50vh"
            value={code}
            onMount={onMount}
            onChange={code => setCode(code ?? '')}
        />
    </>;

    let rightPane = <>
        <Form.Label><b>Server log</b></Form.Label>
        <ButtonToolbar className="gap-2 mb-3">
            <Button variant="secondary" onClick={() => setLog([])}>Clear</Button>
            <Button variant="secondary" onClick={() => 0}>Freeze</Button>
        </ButtonToolbar>
        <Form.Control
            as="textarea"
            plaintext
            readOnly
            style={{
                fontFamily: 'monospace',
                fontSize: '10px',
                height: '50vh',
                whiteSpace: 'pre',
            }}
            value={renderLog()}
        />
    </>;

    return <Slider left={leftPane} right={rightPane} initialPos={250} />;

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

    function renderLog(): string {
        return log.map(
            entry => entry.lines.map(line => entry.timestamp + ' ' + line + '\n').join('')
        ).join('');
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
