import 'bootstrap/dist/css/bootstrap.min.css';
import './coderogue.css';

import { useRef } from 'react';

import MapPane from '../panes/map_pane';
import PlayerPane from '../panes/player_pane';
import TabPane from '../panes/tab_pane';
import AlertPane from '../panes/alert_pane';

import Client from './client';
import * as Context from './context';
import KeyBindingProvider from './key_bindings';
import { useGetStateQuery } from './server_api.js';

const client = new Client();
window.onload = () => client.start();

export default function Page() {
    useGetStateQuery(undefined, { pollingInterval: 1000 });
    const codeAccessor = useRef<Context.CodeAccessorType>(Context.emptyCodeAccessor);

    return (
        <KeyBindingProvider>
            <Context.ClientInstance.Provider value={client}>
                <Context.CodeAccessor.Provider value={codeAccessor}>
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
                </Context.CodeAccessor.Provider>
            </Context.ClientInstance.Provider>
        </KeyBindingProvider>
    );
}
