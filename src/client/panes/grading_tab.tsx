import { Stack, Table } from 'react-bootstrap';

import { useAppSelector } from '../client/redux_hooks';

import { useGetStateQuery } from '../state/server_api';

import { PlayerData } from '../../shared/protocol';

type ScoreEntry = {
    email: string,
    score: number,
};

const numColumns = 3;

export default function GradingTab() {
    const gameState = useGetStateQuery()?.data;
    const currentPlayer = useAppSelector(state => state.login?.credentials?.playerId ?? null);

    if (currentPlayer == null || !gameState) return null;
    if (!gameState.players[currentPlayer]?.isTeacher) return null;
    let players = gameState.players.filter(p => p) as PlayerData[];
    let scores = players
        .filter(p => !p.isGrownup)
        .map(p => ({ email: p.email, score: calculateScore(p) } as ScoreEntry))
        .filter(e => e.score > 0)
        .sort((a, b) => b.score - a.score);
    let chunkSize = Math.ceil(scores.length / numColumns);
    let columns: ScoreEntry[][] = [];
    for (let i = 0; i < numColumns; i++) {
        columns.push(scores.slice(i * chunkSize, (i + 1) * chunkSize));
    }

    return <>
        <Stack direction="horizontal" className="align-items-start justify-content-between">
            {columns.map(renderColumn)}
        </Stack>
    </>;

    function calculateScore(stats: PlayerData): number {
        let ttc = stats.ttc;
        if (stats.bestTtc && (!ttc || stats.bestTtc < ttc)) ttc = stats.bestTtc;
        return (ttc && ttc < 340)? Math.min(Math.round(340 - ttc), 100) : 0;
    }

    function renderColumn(column: ScoreEntry[], i: number): JSX.Element {
        return <div className="col-3" key={i}>
            <Table>
                <thead>
                    <tr>
                        <th>E-mail</th>
                        <th className="text-end">Score</th>
                    </tr>
                </thead>
                <tbody>{column.map(renderRow)}</tbody>
            </Table>
        </div>;
    }

    function renderRow(row: ScoreEntry): JSX.Element {
        return <tr key={row.email}>
            <td>{row.email}</td>
            <td className="text-end">{row.score}%</td>
        </tr>;
    }
}
