import { createContext, StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import 'bootstrap/dist/css/bootstrap.min.css';
import './coderogue.css';

import { LoginResponse, StateResponse } from '../shared/protocol';

import Client from './client';
import Page from './page';

// Client will be (mostly?) deprecated
const client = new Client();
window.onload = () => client.start();
export const ClientContext = createContext<Client>(client);

// State received from the server
export const LoginContext = createContext<LoginResponse | null>(null);
export const GameStateContext = createContext<StateResponse | null>(null);
export const CodeContext = createContext<string>('');
export const LogContext = createContext<string>('');

// Local shared display state
export const ShowingLevelContext = createContext<number>(1);
export const HighlightedPlayerContext = createContext<number | null>(null);
export const CurrentTabContext = createContext<string>('code');

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <Page />
    </StrictMode>,
);
