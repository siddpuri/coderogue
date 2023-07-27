import React, { createContext } from 'react';

import { LoginResponse, StateResponse } from '../shared/protocol.js';

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
export const Login = createMutableContext<LoginResponse | null>(null);
export const emptyStateResponse = { players: [], levels: [] };
export const GameState = createMutableContext<StateResponse>(emptyStateResponse);
export const Log = createMutableContext('');

// Exposed controls for components
export type MapAccessorType = {
    setStyle: (style: number) => void,
    highlightPlayer: (player: number) => void,
};
export const emptyMapAccessor = { setStyle: none, highlightPlayer: none };
export const MapAccessor = createRefContext<MapAccessorType>(emptyMapAccessor);

export type CodeAccessorType = {
    getCode: () => string,
    setCode: (code: string) => void,
};
export const emptyCodeAccessor = { getCode: () => '', setCode: none };
export const CodeAccessor = createRefContext<CodeAccessorType>(emptyCodeAccessor);
