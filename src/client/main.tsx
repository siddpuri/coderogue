import React, { useState, useRef, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import 'bootstrap/dist/css/bootstrap.min.css';
import './coderogue.css';

import { LoginRequest, LoginResponse, StateResponse } from '../shared/protocol.js';

import Client from './client';
import * as Context from './context';

import MapPane from './panes/map_pane';
import PlayerPane from './panes/player_pane';
import TabPane from './panes/tab_pane';
import AlertPane from './panes/alert_pane';

const baseUrl = window.location.origin;

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
    const log = useState('Log in to see your log.');
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

    let busy = false;
    useEffect(() => {
        let interval = setInterval(tick, 1000);
        return () => clearInterval(interval);
    });

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

    async function tick(): Promise<void> {
        if (busy) { return; }
        busy = true;
        try {
            let result = await getJson<StateResponse>('state');
            if (!result) return;
            gameState[1](result);
            client.display.setState(result);
        } finally {
            busy = false;
        }
    }

    async function login(credentials: LoginRequest): Promise<void> {
        let result = await postJson<LoginResponse>('login', credentials);
        if (result) loginState[1](result);
    }

    async function loadCode(): Promise<void> {
        let result = await postJson<string>('code');
        if (result) codeAccessor.current.setCode(result);
    }

    async function loadLog(): Promise<void> {
        let result = await getJson<string>('log');
        if (result) log[1](result);
    }

    async function submitCode(): Promise<void> {
        let code = codeAccessor.current.getCode();
        let result = await postJson<StateResponse>('code', { code });
        if (result) gameState[1](result);
        if (result) client.display.setState(result);
    }

    async function respawn(): Promise<void> {
        await postJson('respawn');
    }

    async function getJson<T>(name: string): Promise<T | null> {
        let response = await fetch(`${baseUrl}/api/${name}`);
        let result = await response.json();
        if (result.error) {
            client.display.say(result.error, 3);
            return null;
        }
        return result;
    }

    async function postJson<T>(name: string, args: object = {}): Promise<T | null> {
        let response = await fetch(
            `${baseUrl}/api/${name}`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(args),
            }
        );
        let result = await response.json();
        if (result.error) {
            client.display.say(result.error, 3);
            return null;
        }
        return result;
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
