import MapPane from './panes/map_pane';
import PlayerPane from './panes/player_pane';
import TabPane from './panes/tab_pane';
import AlertPane from './panes/alert_pane';

export default function Page() {
    return (
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
    );
}
