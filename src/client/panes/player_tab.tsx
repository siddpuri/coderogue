import { Stack, Table } from 'react-bootstrap';
import { Chart } from 'chart.js';
import { CategoryScale, LinearScale, PointElement, LineElement } from 'chart.js';
import { Title, Filler } from 'chart.js';
import { Line } from 'react-chartjs-2';

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
    value: number | [number, number] | string,
};

const chartLength = 100;

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

    let bestTtc = cumulativeTimePerCompletion[2];
    if (stats.bestTtc) {
        rows.push({ label: 'Best previous t/c', values: [0, 0, stats.bestTtc] });
        if (!bestTtc || stats.bestTtc < bestTtc) bestTtc = stats.bestTtc;
    }
    if (bestTtc) {
        let grade = 340 - bestTtc;
        if (grade > 0) {
            if (grade > 100) grade = 100;
            rows.push({ label: 'Grade (percentage)', values: [0, 0, grade] });
        }
    }

    let isGrownup = gameState?.players[stats.id]?.isGrownup;
    let isTeacher = gameState?.players[stats.id]?.isTeacher;

    let info: PlayerInfo[] = [
        { label: 'Level', value: stats.levelNumber },
        { label: 'Position', value: stats.pos },
        { label: 'Direction', value: stats.dir },
        { label: 'Idle time', value: stats.idle },
        { label: 'Offenses', value: stats.offenses },
        { label: 'Jail time', value: stats.jailtime },
        { label: 'Player id', value: stats.id },
        { label: 'Grownup', value: isGrownup? '✔' : '✘' },
        { label: 'Teacher', value: isTeacher? '✔' : '✘' },
    ];
    if (stats.email) info.push({ label: 'Email', value: stats.email });
    
    Chart.register(CategoryScale, LinearScale, PointElement, LineElement);
    Chart.register(Title, Filler);

    return <>
        <Stack direction="horizontal" className="align-items-start justify-content-between">
            <div className="col-4">
                <Table>
                    <thead>
                        <tr>
                            <th>Level</th>
                            {columns.map((s, i) => <th className="text-end" key={i}>{s}</th>)}
                        </tr>
                    </thead>
                    <tbody>{rows.map(renderRow)}</tbody>
                </Table>
            </div>
            <div className="col-4">
                <Stack>
                    <div className="text-center">Past score in five-minute increments</div>
                    <Line
                        options={{
                            scales: {
                                x: { ticks: { callback: tickFunction }},
                                y: { beginAtZero: true, suggestedMax: 2000 }
                            },
                            animation: false,
                        }}
                        data={{
                            labels: new Array(chartLength).fill(0),
                            datasets: [{
                                borderColor: '#808080',
                                backgroundColor: '#e0e0e0',
                                borderWidth: 1,
                                pointStyle: false,
                                fill: true,
                                data: stats.chartData ?? new Array(chartLength).fill(0),
                            }],
                        }}
                    />
                </Stack>
            </div>
            <div className="col-2">
                <Table>
                    <tbody>{info.map(renderInfo)}</tbody>
                </Table>
            </div>
        </Stack>
    </>;

    function tickFunction(value: string | number, index: number): string | undefined {
        if (index == 0) return 'cur';
        if (index % 12 == 0) return `${index / 12}h`;
    }

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
