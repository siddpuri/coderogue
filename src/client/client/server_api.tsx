import React, { useContext, useEffect } from 'react';
import { useAppDispatch } from '../redux_hooks';
import { updateState, updateLog } from '../state/game_state';

import { StateResponse } from '../../shared/protocol.js';

import * as Context from './context.js';

const baseUrl = window.location.origin;

export default function ServerApiProvider({ children }: React.PropsWithChildren<object>) {
    const client = useContext(Context.ClientInstance);
    const codeAccessor = useContext(Context.CodeAccessor);
    const dispatch = useAppDispatch();
    
    let busy = false;
    useEffect(() => {
        let interval = setInterval(tick, 1000);
        return () => clearInterval(interval);
    });
    
    const serverApi = { loadCode, loadLog, submitCode, respawn };

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
            dispatch(updateState(result));
            client.display.setState(result);
        } finally {
            busy = false;
        }
    }

    async function loadCode(): Promise<void> {
        let result = await postJson<string>('code');
        if (result) codeAccessor.current.setCode(result);
    }

    async function loadLog(): Promise<void> {
        let result = await getJson<string>('log');
        if (result) dispatch(updateLog(result));
    }

    async function submitCode(): Promise<void> {
        let code = codeAccessor.current.getCode();
        let result = await postJson<StateResponse>('code', { code });
        if (!result) return;
        dispatch(updateState(result));
        client.display.setState(result);
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
