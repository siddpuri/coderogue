import Tab from 'react-bootstrap/Tab';
import Tabs from 'react-bootstrap/Tabs';

import CodeTab from '../tabs/code_tab';
import NewsTab from '../tabs/news_tab';
import GeneralTab from '../tabs/general_tab';
import ApiTab from '../tabs/api_tab';
import LevelsTab from '../tabs/levels_tab';
import KeybindingsTab from '../tabs/keybindings_tab';
import AccountTab from '../tabs/account_tab';

export default function TabPane() {
    return (
        <Tabs
            defaultActiveKey="code"
            id="tab-pane"
            className="mt-3 mb-3"
            justify>

            <Tab eventKey="code" title="Code">
                <CodeTab />
            </Tab>

            <Tab eventKey="log" title="Log">
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
            </Tab>

            <Tab eventKey="player" title="Player">
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
            </Tab>

            <Tab eventKey="news" title="News">
                <NewsTab />
            </Tab>

            <Tab eventKey="general" title="General">
                <GeneralTab />
            </Tab>

            <Tab eventKey="api" title="Api">
                <ApiTab />
            </Tab>

            <Tab eventKey="levels" title="Levels">
                <LevelsTab />
            </Tab>

            <Tab eventKey="keybindings" title="Shortcuts">
                <KeybindingsTab />
            </Tab>

            <Tab eventKey="account" title="Account">
                <AccountTab />
            </Tab>

        </Tabs>
    );
}
