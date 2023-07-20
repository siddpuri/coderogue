import React from 'react';

export default class App extends React.Component {
    render() {
        return (
            <div className="container-fluid">
                <div className="px-3 pt-3 pb-5">

                    {/* Top pane */}
                    <div className="row">
                        <div className="col">
                            <div className="row align-items-baseline">
                                <div className="col h2">
                                    Coderogue
                                </div>
                                <div className="col h4 d-flex text-nowrap">
                                    <div className="level">
                                        level <span id="level">1</span>:
                                        <span id="level-name">The Plains</span>
                                    </div>
                                    <div className="btn-group ms-2 mb-2">
                                        <button type="button" className="btn btn-sm btn-light text-muted" id="prev-level">⟨</button>
                                        <button type="button" className="btn btn-sm btn-light text-muted" id="next-level">⟩</button>
                                    </div>
                                </div>
                                <div className="col d-flex justify-content-end fade" id="coords">
                                    <div className="coords">
                                        [
                                        <span className="coord" id="x-coord" /> ,
                                        <span className="coord" id="y-coord" />
                                        ]
                                    </div>
                                </div>
                            </div>
                            <canvas id="canvas" />
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
                                <div className="col-10">
                                    <div id="monaco-editor-container" />
                                </div>
                                <div className="col">
                                    <div className="d-grid gap-2">
                                        <button type="button" className="btn btn-secondary" id="respawn1">Respawn</button>
                                        <button type="button" className="btn btn-secondary" id="reformat">Reformat</button>
                                        <button type="button" className="btn btn-primary" id="submit">Submit</button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Log tab */}
                        <div className="tab-pane" id="log" role="tabpanel">
                            <div className="row">
                                <div className="col">
                                    <textarea className="form-control font-monospace" id="log-text" rows={20} defaultValue={""} />
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
                                    {/* Loaded from news.html */}
                                </div>
                            </div>
                        </div>

                        {/* General documentation tab */}
                        <div className="tab-pane" id="general" role="tabpanel">
                            <div className="row">
                                <div className="col-8" id="general-text">
                                    {/* Loaded from general.html */}
                                </div>
                            </div>
                        </div>

                        {/* API documentation tab */}
                        <div className="tab-pane" id="api" role="tabpanel">
                            <div className="row">
                                <div className="col-8" id="api-text">
                                    {/* Loaded from api.html */}
                                </div>
                            </div>
                        </div>

                        {/* Level documentation tab */}
                        <div className="tab-pane" id="levels" role="tabpanel">
                            <div className="row">
                                <div className="col-8" id="levels-text">
                                    {/* Loaded from levels.html */}
                                </div>
                            </div>
                        </div>

                        {/* Keybindings documentation tab */}
                        <div className="tab-pane" id="keybindings" role="tabpanel">
                            <div className="row">
                                <div className="col-8" id="keybindings-text">
                                    {/* Loaded from keybindings.html */}
                                </div>
                            </div>
                        </div>

                        {/* Account tab */}
                        <div className="tab-pane" id="account" role="tabpanel">
                            {/* Loaded from account.html */}
                        </div>
                    </div>
                </div>

                <div className="position-fixed start-0 end-0 bottom-0 clickthrough">
                    <div className="alert fade px-4 pt-1 pb-1 mb-0" id="message" />
                </div>
            </div>
        );
    }
}
