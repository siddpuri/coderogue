import { useAppSelector } from '../client/redux_hooks';

import { useGetStateQuery } from '../state/server_api';

import { PlayerData } from '../../shared/protocol';
import Util from '../../shared/util';

type RowInfo = {
    label: string,
    values: number[],
    precision?: number,
};

type PlayerInfo = {
    label: string,
    value: number | [number, number],
};

export default function PlayerTab() {
    const gameState = useGetStateQuery()?.data;
    const currentPlayer = useAppSelector(state => state.login?.credentials?.playerId ?? null);
    const display = useAppSelector(state => state.display);

    let player = display.highlightedPlayer ?? currentPlayer;
    if (player == null || !gameState?.players[player]) return null;
    let stats = gameState?.players[player] as PlayerData;
    if (!stats) return null;

    let scorePerSecond = stats.score.map((x, i) => x / stats.timeSpent[i]);
    let timePerCompletion = stats.timesCompleted.map((x, i) => x? stats.timeSpent[i] / x : 0);
    let cumulativeTimePerCompletion = timePerCompletion.slice();
    for (let i = 1; i < cumulativeTimePerCompletion.length; i++) {
        cumulativeTimePerCompletion[i] += cumulativeTimePerCompletion[i - 1];
    }

    let columns = ['J', '0', '1', '2', '3'];
    let rows: RowInfo[] = [
        { label: 'Seconds spent', values: stats.timeSpent },
        { label: 'Times completed', values: stats.timesCompleted },
        { label: 'Score/second', values: scorePerSecond, precision: 2 },
        { label: 'Time/completion', values: timePerCompletion },
        { label: 'Cumulative t/c', values: cumulativeTimePerCompletion },
    ];

    let info: PlayerInfo[] = [
        { label: 'Level', value: stats.levelNumber },
        { label: 'Position', value: stats.pos },
        { label: 'Direction', value: stats.dir },
        { label: 'Idle time', value: stats.idle },
        { label: 'Offenses', value: stats.offenses },
        { label: 'Jail time', value: stats.jailtime },
        { label: 'Player id', value: stats.id },
        { label: 'Handle #', value: stats.handle },
    ]
    
    return <>
        <div className="row d-flex justify-content-between">
            <div className="col-4">
                <table className="table" id="player-stats">
                    <thead>
                        <tr>
                            <th>Level</th>
                            {columns.map((s, i) => <th className="text-end" key={i}>{s}</th>)}
                        </tr>
                    </thead>
                    <tbody>
                        {rows.map(renderRow)}
                    </tbody>
                </table>
            </div>
            <div className="col-4">
                <canvas id="player-chart" />
            </div>
            <div className="col-2">
                <table className="table" id="player-info">
                    <tbody>
                        {info.map(renderInfo)}
                    </tbody>
                </table>
            </div>
        </div>
    </>;

    function renderRow(row: RowInfo): JSX.Element {
        return (
            <tr key={row.label}>
                <td style={{whiteSpace: "nowrap"}}>{row.label}</td>
                {(row.values ?? []).map((x, i) => {
                    if (!x) return <td key={i} />;
                    return <td key={i} className="text-end">{x.toFixed(row.precision)}</td>
                })}
            </tr>
        );
    }

    function renderInfo(info: PlayerInfo): JSX.Element {
        return (
            <tr key={info.label}>
                <td>{info.label}</td>
                <td className="text-end">{Util.stringify(info.value)}</td>
            </tr>
        );
    }
}