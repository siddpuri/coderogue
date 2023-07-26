import { useContext, useState } from 'react';

import Button from 'react-bootstrap/Button';

import * as Context from './context';

import CodeTab from './tabs/code_tab';
import NewsTab from './tabs/news_tab';
import GeneralTab from './tabs/general_tab';
import ApiTab from './tabs/api_tab';
import LevelsTab from './tabs/levels_tab';
import KeybindingsTab from './tabs/keybindings_tab';
import AccountTab from './tabs/account_tab';

export default function Page() {
    return (
        <div className="container-fluid">
            <div className="px-3 pt-3 pb-5">
                <TopPane />
                <BottomPane />
            </div>
            <Alert />
        </div>
    );
}

function TopPane() {
    const client = useContext(Context.ClientInstance);
    const state = useContext(Context.GameState)[0];
    const style = useContext(Context.MapStyle)[0];
    const [level, setLevel] = useContext(Context.MapLevel);
    const levelName = state.levels[level]?.name || 'The Plains';

    const [mouseCoords, setMouseCoords] = useState<[number, number] | null>(null);
    
    return (
        <div className="row">
            <div className="col">
                <div className="row align-items-baseline">
                    <div className="col h2">
                        Coderogue
                    </div>
                    <div className="col h4 d-flex text-nowrap">
                        <div className="level">
                            level {level}:{' '}{levelName}
                        </div>
                        <div className="btn-group ms-2 mb-2">
                            <SmallButton text="⟨" onClick={() => switchLevel(-1)} />
                            <SmallButton text="⟩" onClick={() => switchLevel(1)} />
                        </div>
                    </div>
                    <div className="col d-flex justify-content-end">
                        <div className="coords">{renderCoords()}</div>
                    </div>
                </div>
                <canvas
                    id="canvas"
                    onMouseMove={e => updateCoords(e)}
                    onMouseLeave={() => updateCoords(null)} />
            </div>
            <div className="col">
                <div className="row align-items-baseline">
                    <div className="col h2">
                        Players
                    </div>
                    <div className="col d-flex justify-content-end">
                        <div className="btn-group ms-2 mb-2">
                            <button type="button" className="btn btn-sm btn-light text-muted" id="first-players">⟪</button>
                            <button type="button" className="btn btn-sm btn-light text-muted" id="prev-players">⟨</button>
                            <button type="button" className="btn btn-sm btn-light text-muted" id="next-players">⟩</button>
                        </div>
                    </div>
                </div>
                <div className="row">
                    <div className="col">
                        <table className="table table-hover" id="players">
                            <thead><tr>
                                <th>#</th>
                                <th>Score</th>
                                <th>L</th>
                                <th>Handle</th>
                                <th>K</th>
                                <th>D</th>
                            </tr>
                            </thead>
                            <tbody />
                        </table>
                    </div>
                </div>
                <div className="row">
                    <div className="col-8 pe-0">
                        <input type="text" className="form-control" id="handle" placeholder="Handle" />
                    </div>
                    <div className="col pb-0">
                        <div className="d-grid">
                            <button type="button" className="btn btn-secondary" id="find-handle">Find</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    function switchLevel(dir: number): void {
        let newLevel = client.display.switchLevel(dir);
        setLevel(newLevel);
    }

    type eventType = React.MouseEvent<HTMLCanvasElement, MouseEvent>;

    function updateCoords(event: eventType | null): void {
        let coords = event? getCoordsFromEvent(event): null;
        setMouseCoords(coords);
    }

    function getCoordsFromEvent(event: eventType): [number, number] {
        let x = Math.floor(event.nativeEvent.offsetX / 8);
        let y = Math.floor(event.nativeEvent.offsetY / [10, 8][style]);
        return [x, y];
    }
    
    function renderCoords(): string | null {
        if (!mouseCoords) return null;
        return `[ ${mouseCoords[0]}, ${mouseCoords[1]} ]`;
    }
}

function SmallButton({ text, onClick }: { text: string, onClick: () => void }) {
    return (
        <Button
            variant="light"
            size="sm"
            className="text-muted"
            onClick={onClick}
        >
            {text}
        </Button>
    );
}

function BottomPane() {
    return (<>
        {/* Nav tabs in bottom pane */}
        <nav className="nav nav-tabs mt-3 mb-3">
            <a className="nav-link active" id="code-tab" data-bs-toggle="tab" data-bs-target="#code" role="tab">Code</a>
            <a className="nav-link" id="log-tab" data-bs-toggle="tab" data-bs-target="#log" role="tab">Log</a>
            <a className="nav-link" id="player-tab" data-bs-toggle="tab" data-bs-target="#player" role="tab">Player</a>
            <a className="nav-link" id="news-tab" data-bs-toggle="tab" data-bs-target="#news" role="tab">News</a>
            <a className="nav-link" id="general-tab" data-bs-toggle="tab" data-bs-target="#general" role="tab">General</a>
            <a className="nav-link" id="api-tab" data-bs-toggle="tab" data-bs-target="#api" role="tab">Api</a>
            <a className="nav-link" id="levels-tab" data-bs-toggle="tab" data-bs-target="#levels" role="tab">Levels</a>
            <a className="nav-link" id="keybindings-tab" data-bs-toggle="tab" data-bs-target="#keybindings" role="tab">Shortcuts</a>
            <a className="nav-link" id="account-tab" data-bs-toggle="tab" data-bs-target="#account" role="tab">Account</a>
        </nav>

        <div className="tab-content">

            {/* Code tab */}
            <div className="tab-pane active" id="code" role="tabpanel">
                <div className="row">
                    <CodeTab />
                </div>
            </div>

            {/* Log tab */}
            <div className="tab-pane" id="log" role="tabpanel">
                <div className="row">
                    <div className="col">
                        <textarea className="form-control font-monospace" id="log-text" rows={20} />
                    </div>
                    <div className="col-2">
                        <div className="d-grid gap-2">
                            <button type="button" className="btn btn-secondary" id="respawn2">Respawn</button>
                            <button type="button" className="btn btn-secondary" id="freeze">Freeze</button>
                            <div className="btn-group-vertical">
                                <button type="button" className="btn btn-secondary active" id="show-all">Show all</button>
                                <button type="button" className="btn btn-secondary" id="show-latest">Just latest</button>
                                <button type="button" className="btn btn-secondary" id="show-filtered">Filter by</button>
                                <input type="text" className="form-control" id="filter-text" placeholder="Filter" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Player tab */}
            <div className="tab-pane" id="player" role="tabpanel">
                <div className="row d-flex justify-content-between">
                    <div className="col-4">
                        <table className="table" id="player-stats">
                            <thead>
                                <tr>
                                    <th>Level</th>
                                    <th className="table-col">J</th>
                                    <th className="table-col">0</th>
                                    <th className="table-col">1</th>
                                    <th className="table-col">2</th>
                                    <th className="table-col">3</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr><td>Seconds spent</td></tr>
                                <tr><td>Times completed</td></tr>
                                <tr><td>Score/second</td></tr>
                                <tr><td>Time/completion</td></tr>
                                <tr><td>Cumulative t/c</td></tr>
                                <tr><td>Project goal met?</td></tr>
                            </tbody>
                        </table>
                    </div>
                    <div className="col-4">
                        <canvas id="player-chart" />
                    </div>
                    <div className="col-2">
                        <table className="table" id="player-info">
                            <tbody>
                                <tr><td>Level</td><td className="table-col" /></tr>
                                <tr><td>Position</td><td className="table-col" /></tr>
                                <tr><td>Direction</td><td className="table-col" /></tr>
                                <tr><td>Idle time</td><td className="table-col" /></tr>
                                <tr><td>Offenses</td><td className="table-col" /></tr>
                                <tr><td>Jail time</td><td className="table-col" /></tr>
                                <tr><td>Player id</td><td className="table-col" /></tr>
                                <tr><td>Handle #</td><td className="table-col" /></tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* News tab */}
            <div className="tab-pane" id="news" role="tabpanel">
                <div className="row">
                    <div className="col-8" id="news-text">
                        <NewsTab />
                    </div>
                </div>
            </div>

            {/* General documentation tab */}
            <div className="tab-pane" id="general" role="tabpanel">
                <div className="row">
                    <div className="col-8" id="general-text">
                        <GeneralTab />
                    </div>
                </div>
            </div>

            {/* API documentation tab */}
            <div className="tab-pane" id="api" role="tabpanel">
                <div className="row">
                    <div className="col-8" id="api-text">
                        <ApiTab />
                    </div>
                </div>
            </div>

            {/* Level documentation tab */}
            <div className="tab-pane" id="levels" role="tabpanel">
                <div className="row">
                    <div className="col-8" id="levels-text">
                        <LevelsTab />
                    </div>
                </div>
            </div>

            {/* Keybindings documentation tab */}
            <div className="tab-pane" id="keybindings" role="tabpanel">
                <div className="row">
                    <div className="col-8" id="keybindings-text">
                        <KeybindingsTab />
                    </div>
                </div>
            </div>

            {/* Account tab */}
            <div className="tab-pane" id="account" role="tabpanel">
                <AccountTab />
            </div>
        </div>
    </>);
}

function Alert() {
    return (
        <div className="position-fixed start-0 end-0 bottom-0 clickthrough">
            <div className="alert fade px-4 pt-1 pb-1 mb-0" id="message" />
        </div>
    );
}