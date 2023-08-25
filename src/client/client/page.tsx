import 'bootstrap/dist/css/bootstrap.min.css';
import './coderogue.css';

import { PropsWithChildren, useState, useRef } from 'react';
import { Provider } from 'react-redux';

import { StateResponse } from '../../shared/protocol.js';

import Client from './client';
import * as Context from './context';
import { store } from '../redux_store.js';
import ServerApiProvider from './server_api';
import KeyBindingProvider from './key_bindings';

import MapPane from '../panes/map_pane';
import PlayerPane from '../panes/player_pane';
import TabPane from '../panes/tab_pane';
import AlertPane from '../panes/alert_pane';

const client = new Client();
window.onload = () => client.start();

export default function Page() {
    return (
        <Wrapper>
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
        </Wrapper>
    );
}

function Wrapper({ children }: PropsWithChildren<object>) {
    const gameState = useState<StateResponse | null>(null);
    const log = useState<string | null>(null);
    const codeAccessor = useRef<Context.CodeAccessorType>(Context.emptyCodeAccessor);

    let result = children;
    result = <KeyBindingProvider>{result}</KeyBindingProvider>;
    result = <ServerApiProvider>{result}</ServerApiProvider>;
    result = <Context.ClientInstance.Provider value={client}>{result}</Context.ClientInstance.Provider>;
    result = <Context.GameState.Provider value={gameState}>{result}</Context.GameState.Provider>;
    result = <Context.Log.Provider value={log}>{result}</Context.Log.Provider>;
    result = <Context.CodeAccessor.Provider value={codeAccessor}>{result}</Context.CodeAccessor.Provider>;
    result = <Provider store={store}>{result}</Provider>;
    return result;
}
