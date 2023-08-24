import React, { createContext } from 'react';

import { StateResponse } from '../shared/protocol.js';

import Client from './client.js';

type State<T> = [T, React.Dispatch<React.SetStateAction<T>>];

function createMutableContext<T>(x: T): React.Context<State<T>> {
    return createContext<State<T>>([x, x => x]);
}

function createRefContext<T>(x: T): React.Context<React.MutableRefObject<T>> {
    return createContext<React.MutableRefObject<T>>({ current: x });
}

const none = () => { /* empty */ };

// Client instance; this should end up being mostly deprecated
export const ClientInstance = createContext<Client>(null!);

// State received from the server
export const GameState = createMutableContext<StateResponse | null>(null);
export const Log = createMutableContext<string | null>(null);

// Exposed controls for components
export type ServerApiType = {
    loadCode: () => void,
    loadLog: () => void,
    submitCode: () => void,
    respawn: () => void,
}
export const emptyServerApi = { loadCode: none, loadLog: none, submitCode: none, respawn: none };
export const ServerApi = createContext<ServerApiType>(emptyServerApi);

export type CodeAccessorType = {
    getCode: () => string,
    setCode: (code: string) => void,
};
export const emptyCodeAccessor = { getCode: () => '', setCode: none };
export const CodeAccessor = createRefContext<CodeAccessorType>(emptyCodeAccessor);
