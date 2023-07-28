import React, { useContext, useEffect } from 'react';

import { LoginRequest, LoginResponse, StateResponse } from '../shared/protocol.js';

import * as Context from './context.js';

const baseUrl = window.location.origin;

export default function ServerApiProvider({ children }: React.PropsWithChildren<object>) {
    const client = useContext(Context.ClientInstance);
    const loginState = useContext(Context.Login);
    const gameState = useContext(Context.GameState);
    const log = useContext(Context.Log);
    const codeAccessor = useContext(Context.CodeAccessor);
    
    let busy = false;
    useEffect(() => {
        let interval = setInterval(tick, 1000);
        return () => clearInterval(interval);
    });
    
    const serverApi = { login, loadCode, loadLog, submitCode, respawn };

    return (
        <Context.ServerApi.Provider value={serverApi}>
            {children}
        </Context.ServerApi.Provider>
    );

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
