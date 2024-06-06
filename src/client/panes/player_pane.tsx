import { useState } from 'react';
import { Stack, Table, Form } from 'react-bootstrap';

import { useAppSelector, useAppDispatch } from '../client/redux_hooks';

import { useGetStateQuery } from '../state/server_api';
import { displaySlice } from '../state/display_state';
import { alertSlice } from '../state/alert_state';

import { PlayerData } from '../../shared/protocol';
import Handles from '../../shared/handles';

import LeftRightButtons from '../components/left_right_buttons';
import SimpleButton from '../components/simple_button';

type PlayerStats = {
    id: number,
    textHandle: string,
    levelNumber: number,
    kills: number,
    deaths: number,
    score: number,
    rank?: number,
    highlight: boolean,
}

const numPlayersToRender = 10;
const playerColumns = ['#', 'Score', 'L', 'Handle', 'K', 'D'];

export default function PlayerPane() {
    const gameState = useGetStateQuery()?.data;
    const currentPlayer = useAppSelector(state => state.login?.credentials?.playerId ?? null);
    const firstPlayer = useAppSelector(state => state.display.firstPlayer);
    const showAll = useAppSelector(state => state.display.showAll);
    const highlightedPlayer = useAppSelector(state => state.display.highlightedPlayer);
    const dispatch = useAppDispatch();

    const [findValue, setFindValue] = useState('');

    const players = gameState?.players ?? [];
    const numPlayers = gameState?.players.filter(p => p).length || 0;

    return <>
        <Stack>
            <Stack direction="horizontal" className="align-items-baseline">
                <div className="h2">Players</div>
                <div className="ms-auto">
                    <LeftRightButtons
                        onLeftLeft={() => dispatch(displaySlice.actions.showFirstPlayer())}
                        onLeft={() => dispatch(displaySlice.actions.showPrevPlayer())}
                        onRight={() => dispatch(displaySlice.actions.showNextPlayer(numPlayers))}
                        onRightRight={() => dispatch(displaySlice.actions.showLastPlayer(numPlayers))}
                    />
                </div>
            </Stack>

            <Table hover>
                <thead>
                    <tr>{playerColumns.map((s, i) => <th key={i}>{s}</th>)}</tr>
                </thead>
                <tbody>{renderPlayers()}</tbody>
            </Table>

            <Stack direction="horizontal" gap={3}>
                <Form.Control
                    placeholder="Handle"
                    onChange={e => setFindValue(e.target.value)}
                    onKeyDown={e => e.key == 'Enter' && findPlayer()}
                />
                <SimpleButton text="Find" onClick={findPlayer} />
            </Stack>

            {isGrownup(currentPlayer)? null:
                <Stack direction="horizontal" gap={3} className="mt-3">
                    Show grownups
                    <Form.Check
                        checked={showAll}
                        onChange={() => dispatch(displaySlice.actions.setShowAll(!showAll))}
                    />
                </Stack>
            }
        </Stack>
    </>;

    function renderPlayers(): JSX.Element[] {
        let stats: (PlayerStats | undefined)[] = players.map(getStats);
        if (!isGrownup(currentPlayer) && !showAll) {
            stats.forEach(s => { if (s && isGrownup(s.id)) s.score = 0; });
        }
        if (highlightedPlayer) stats[highlightedPlayer]!.highlight = true;

        let statsToRender: (PlayerStats | undefined)[] = [];
        if (currentPlayer && stats[currentPlayer]) statsToRender.push(stats[currentPlayer]!);
        if (highlightedPlayer && highlightedPlayer != currentPlayer) {
            statsToRender.push(stats[highlightedPlayer]!);
        }

        let topStats: PlayerStats[] = stats.filter(s => s) as PlayerStats[];
        topStats.sort((a, b) => b.score - a.score);
        topStats.forEach((s, i) => s.rank = i + 1);

        for (let i = firstPlayer; statsToRender.length < numPlayersToRender; i++) {
            let stat = topStats[i];
            if (!stat || !statsToRender.some(s => s!.id == stat.id)) {
                statsToRender.push(stat);
            }
        }
        statsToRender.sort((a, b) => a!.rank! - b!.rank!);
        return statsToRender.map(renderStats);
    }

    function getStats(player: PlayerData | undefined): PlayerStats | undefined {
        return player ? {
            id: player.id,
            textHandle: Handles.getTextHandle(player.handle),
            levelNumber: player.levelNumber - 1,
            kills: player.kills.reduce((a, b) => a + b, 0),
            deaths: player.deaths.reduce((a, b) => a + b, 0),
            score: player.score.reduce((a, b) => a + b, 0),
            highlight: false,
        } : undefined;
    }

    function renderStats(stats: PlayerStats | undefined, i: number): JSX.Element {
        return stats ?
            <tr
                key={i}
                className={stats.highlight ? 'highlighted' : ''}
                onClick={() => dispatch(displaySlice.actions.highlightPlayer(stats.id))}
            >
                <td>{stats.rank}</td>
                <td>{stats.score}</td>
                <td>{stats.levelNumber >= 0 ? stats.levelNumber : 'J'}</td>
                <td>{stats.textHandle}</td>
                <td>{stats.kills}</td>
                <td>{stats.deaths}</td>
            </tr> :
            <tr key={i} className='invisible'>
                {playerColumns.map((s, i) => <td key={i}>{s}</td>)}
            </tr>;
    }

    function findPlayer(): void {
        if (!findValue) {
            dispatch(displaySlice.actions.highlightPlayer(null));
            return;
        }
        let player = players.findIndex(
            p => p && Handles.getTextHandle(p.handle) == findValue);
        if (player < 0) {
            dispatch(alertSlice.actions.showError(`Player ${findValue} not found`));
            return;
        }
        if (player == highlightedPlayer) return;
        dispatch(displaySlice.actions.highlightPlayer(player));
        dispatch(alertSlice.actions.showSuccess(`Highlighted player ${findValue}`))
    }

    function isGrownup(id: number | null): boolean {
        return !!(id && gameState?.players[id]?.isGrownup);
    }
}
