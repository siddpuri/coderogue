import 'bootstrap/dist/css/bootstrap.min.css';
import '../assets/coderogue.css';

import { useAppSelector } from './redux_hooks';

import { useGetStateQuery, useLoadCodeQuery } from '../state/server_api.js';

import KeyBindingProvider from './key_bindings';

import MapPane from '../components/map_pane';
import PlayerPane from '../components/player_pane';
import TabPane from '../components/tab_pane';
import AlertPane from '../components/alert_pane.js';


export default function Page() {
    useGetStateQuery(undefined, { pollingInterval: 1000 });
    const currentPlayer = useAppSelector(state => state.login?.credentials?.playerId ?? null);
    if (currentPlayer) useLoadCodeQuery();

    return <>
        <KeyBindingProvider>
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
        </KeyBindingProvider>
    </>;
}
