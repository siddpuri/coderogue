export default function PlayerTab() {
    return <>
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
    </>;
}