import React, { useState, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import 'bootstrap/dist/css/bootstrap.min.css';
import './coderogue.css';

import { LoginResponse, StateResponse } from '../shared/protocol.js';

import Client from './client';
import * as Context from './context';

import MapPane from './panes/map_pane';
import PlayerPane from './panes/player_pane';
import TabPane from './panes/tab_pane';
import AlertPane from './panes/alert_pane';

const client = new Client();
window.onload = () => client.start();

createRoot(document.getElementById('root')!).render(
    <Wrapper>
        <Page />
    </Wrapper>
);

function Wrapper({ children }: React.PropsWithChildren<object>) {
    const loginState = useState<LoginResponse | null>(null);
    const gameState = useState<StateResponse>(Context.emptyStateResponse);
    const log = useState('');
    const mapAccessor = useRef<Context.MapAccessorType>(Context.emptyMapAccessor);
    const codeAccessor = useRef<Context.CodeAccessorType>(Context.emptyCodeAccessor);

    const keybindings: { [key: string]: () => void } = {
        'C-s':           () => client.buttonHooks.submit(),
        'C-[':           () => client.display.switchTab(-1),
        'C-]':           () => client.display.switchTab(1),
        'C-ArrowUp':     () => mapAccessor.current.switchLevel(1),
        'C-ArrowDown':   () => mapAccessor.current.switchLevel(-1),
        'C-S-ArrowUp':   () => mapAccessor.current.setStyle(1),
        'C-S-ArrowDown': () => mapAccessor.current.setStyle(0),
    };

    let result = children;
    result = <Context.ClientInstance.Provider value={client}>{result}</Context.ClientInstance.Provider>;
    result = <Context.Login.Provider value={loginState}>{result}</Context.Login.Provider>;
    result = <Context.GameState.Provider value={gameState}>{result}</Context.GameState.Provider>;
    result = <Context.Log.Provider value={log}>{result}</Context.Log.Provider>;
    result = <Context.MapAccessor.Provider value={mapAccessor}>{result}</Context.MapAccessor.Provider>;
    result = <Context.CodeAccessor.Provider value={codeAccessor}>{result}</Context.CodeAccessor.Provider>;
    result = <div onKeyDown={onKeyDown}>{result}</div>;
    result = <React.StrictMode>{result}</React.StrictMode>;
    return result;

    function onKeyDown(event: React.KeyboardEvent<HTMLDivElement>): void {
        let key = event.key;
        if (event.shiftKey) key = 'S-' + key;
        if (event.ctrlKey) key = 'C-' + key;
        if (!keybindings[key]) return;
        keybindings[key]();
        event.preventDefault();
    }
}

function Page() {
    return (
        <div className="container-fluid">
            <div className="px-3 pt-3 pb-5">
                <div className="row">
                    <MapPane />
                    <PlayerPane />
                </div>
                <TabPane />
            </div>
            <AlertPane />
        </div>
    );
}
