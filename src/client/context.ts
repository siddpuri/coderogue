import React, { createContext } from 'react';

import { LoginResponse, StateResponse } from '../shared/protocol.js';

import Client from './client.js';

type State<T> = [T, React.Dispatch<React.SetStateAction<T>>];

function createMutableContext<T>(x: T): React.Context<State<T>> {
    return createContext<State<T>>([x, x => x]);
}

// Client instance; this should end up being mostly deprecated
export const ClientInstance = createContext<Client>(null!);

// State received from the server
export const Login = createMutableContext<LoginResponse | null>(null);
export const emptyStateResponse = { players: [], levels: [] };
export const GameState = createMutableContext<StateResponse>(emptyStateResponse);
export const Log = createMutableContext('');

// Local shared display state
export const MapStyle = createMutableContext(0);
export const MapLevel = createMutableContext(1);
export const HighlightedPlayer = createMutableContext<number | null>(null);

export type CodeAccessorType = { getCode: () => string, setCode: (code: string) => void };
export const emptyCodeAccessor = { getCode: () => '', setCode: () => { /* empty */ } };
export const CodeAccessor = createMutableContext<CodeAccessorType>(emptyCodeAccessor);
