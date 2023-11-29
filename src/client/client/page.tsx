import 'bootstrap/dist/css/bootstrap.min.css';
import '../assets/coderogue.css';

import MapPane from '../components/map_pane';
import PlayerPane from '../components/player_pane';
import TabPane from '../components/tab_pane';
import AlertPane from '../components/alert_pane.js';

import KeyBindingProvider from './key_bindings';
import { useGetStateQuery } from '../state/server_api.js';

export default function Page() {
    useGetStateQuery(undefined, { pollingInterval: 1000 });

    return (
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
    );
}
