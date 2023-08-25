import React, { createContext } from 'react';

import Client from './client.js';

function createRefContext<T>(x: T): React.Context<React.MutableRefObject<T>> {
    return createContext<React.MutableRefObject<T>>({ current: x });
}

const none = () => { /* empty */ };

// Client instance; this should end up being mostly deprecated
export const ClientInstance = createContext<Client>(null!);

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
