import { Stack } from 'react-bootstrap';

import { useAppSelector } from '../client/redux_hooks';
import KeyBindingProvider from '../client/key_bindings';

import { useGetStateQuery } from '../state/server_api';

import MapPane from './map_pane';
import PlayerPane from './player_pane';
import TabPane from './tab_pane';
import AlertPane from './alert_pane';

import 'bootstrap/dist/css/bootstrap.min.css';
import '../assets/coderogue.css';

export default function Page() {
    const isFrozen = useAppSelector(state => state.display.isFrozen);
    useGetStateQuery(undefined, { skip: isFrozen, pollingInterval: 1000 });

    return <>
        <KeyBindingProvider>
            <Stack className="p-3">
                <Stack direction="horizontal" gap={3} className="align-items-start">
                    <MapPane />
                    <PlayerPane />
                </Stack>
                <TabPane />
            </Stack>
            <AlertPane />
        </KeyBindingProvider>
    </>;
}
