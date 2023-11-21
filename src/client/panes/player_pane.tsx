import { useAppSelector, useAppDispatch } from '../redux_hooks';

import { PlayerData } from '../../shared/protocol.js';
import Handles from '../../shared/handles.js';
import Grownups from '../../shared/grownups.js';

import { useGetStateQuery } from '../client/server_api.js';

import { displaySlice } from '../state/display_state';

import LeftRightButtons from '../components/left_right_buttons';

const numPlayersToRender = 10;
const playerColumns = ['#', 'Score', 'L', 'Handle', 'K', 'D'];

export default function PlayerPane() {
    const gameState = useGetStateQuery()?.data;
    const currentPlayer = useAppSelector(state => state.login?.credentials?.playerId ?? null);
    const firstPlayer = useAppSelector(state => state.display.firstPlayer);
    const highlightedPlayer = useAppSelector(state => state.display.highlightedPlayer);
    const actions = displaySlice.actions;
    const dispatch = useAppDispatch();

    const numPlayers = gameState?.players.filter(p => p).length || 0;

    return (
        <div className="col">
            <div className="row align-items-baseline">
                <div className="col h2">
                    Players
                </div>
                <div className="col d-flex justify-content-end">
                    <LeftRightButtons
                        onLeftLeft={() => dispatch(actions.showFirstPlayer())}
                        onLeft={() => dispatch(actions.showPrevPlayer())}
                        onRight={() => dispatch(actions.showNextPlayer(numPlayers))}
                        onRightRight={() => dispatch(actions.showLastPlayer(numPlayers))} />
                </div>
            </div>
            <div className="row">
                <div className="col">
                    <table className="table table-hover">
                        <thead>
                            <tr>
                                {playerColumns.map((s, i) => <th key={i}>{s}</th>)}
                            </tr>
                        </thead>
                        <tbody>
                            {renderPlayers(
                                gameState?.players ?? [],
                                currentPlayer,
                                firstPlayer,
                                highlightedPlayer)}
                        </tbody>
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
    );
}

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

function renderPlayers(
    players: (PlayerData | undefined)[],
    currentPlayer: number | null,
    playerToRender: number,
    highlightedPlayer: number | null
): JSX.Element[] {
    let stats: (PlayerStats | undefined)[] = players.map(getStats);
    if (currentPlayer && !Grownups.includes(currentPlayer)) {
        stats.forEach(s => { if (s && Grownups.includes(s.id)) s.score = 0; });
    }
    if (highlightedPlayer) stats[highlightedPlayer]!.highlight = true;

    let statsToRender: (PlayerStats | undefined)[] = [];
    if (currentPlayer) statsToRender.push(stats[currentPlayer]!);
    if (highlightedPlayer == currentPlayer) highlightedPlayer = null;
    if (highlightedPlayer) statsToRender.push(stats[highlightedPlayer]!);

    let topStats: PlayerStats[] = stats.filter(s => s) as PlayerStats[];
    topStats.sort((a, b) => b.score - a.score);
    topStats.forEach((s, i) => s.rank = i + 1);

    while (statsToRender.length < numPlayersToRender) {
        let stat = topStats[playerToRender++];
        if (!stat || !statsToRender.some(s => s!.id == stat.id)) {
            statsToRender.push(stat);
        }
    }
    return statsToRender.map(renderStats);
}

function getStats(player: PlayerData | undefined): PlayerStats | undefined {
    return player? {
        id: player.id,
        textHandle: Handles.getTextHandle(player.handle),
        levelNumber: player.levelNumber,
        kills: player.kills.reduce((a, b) => a + b, 0),
        deaths: player.deaths.reduce((a, b) => a + b, 0),
        score: player.score.reduce((a, b) => a + b, 0),
        highlight: false,
    }: undefined;
}

function renderStats(stats: PlayerStats | undefined, i: number): JSX.Element {
    return stats?
        <tr key={i} className={stats.highlight? 'highlighted' : ''}>
            <td>{stats.rank}</td>
            <td>{stats.score}</td>
            <td>{stats.levelNumber? stats.levelNumber : 'J'}</td>
            <td>{stats.textHandle}</td>
            <td>{stats.kills}</td>
            <td>{stats.deaths}</td>
        </tr> :
        <tr key={i} className='invisible'>
            {playerColumns.map((s, i) => <td key={i}>{s}</td>)}
        </tr>;
}