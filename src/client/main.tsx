import React, { useState, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import 'bootstrap/dist/css/bootstrap.min.css';
import './coderogue.css';

import { LoginResponse, StateResponse } from '../shared/protocol.js';

import Client from './client';
import * as Context from './context';
import Page from './page';
import { editor } from 'monaco-editor';

const client = new Client();
window.onload = () => client.start();

createRoot(document.getElementById('root')!).render(
    <ContextWrapper>
        <Page />
    </ContextWrapper>
);

function ContextWrapper({ children }: React.PropsWithChildren<object>) {
    const loginState = useState<LoginResponse | null>(null);
    const gameState = useState<StateResponse>({ players: [], levels: [] });
    const log = useState('');
    const mapStyle = useState(0);
    const mapLevel = useState(1);
    const highlightedPlayer = useState<number | null>(null);
    const editor = useRef<editor.IStandaloneCodeEditor | null>(null);

    let result = children;
    result = <Context.ClientInstance.Provider value={client}>{result}</Context.ClientInstance.Provider>;
    result = <Context.Login.Provider value={loginState}>{result}</Context.Login.Provider>;
    result = <Context.GameState.Provider value={gameState}>{result}</Context.GameState.Provider>;
    result = <Context.Log.Provider value={log}>{result}</Context.Log.Provider>;
    result = <Context.MapStyle.Provider value={mapStyle}>{result}</Context.MapStyle.Provider>;
    result = <Context.MapLevel.Provider value={mapLevel}>{result}</Context.MapLevel.Provider>;
    result = <Context.HighlightedPlayer.Provider value={highlightedPlayer}>{result}</Context.HighlightedPlayer.Provider>;
    result = <Context.EditorRef.Provider value={editor}>{result}</Context.EditorRef.Provider>;

    result = <React.StrictMode>{result}</React.StrictMode>;
    return result;
}
