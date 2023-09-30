import { useAppSelector, useAppDispatch } from '../redux_hooks';

import { PlayerData } from '../../shared/protocol.js';
import Grownups from '../../shared/grownups.js';

import { useGetStateQuery } from '../client/server_api.js';

import { displaySlice } from '../state/display_state';

import LeftRightButtons from '../components/left_right_buttons';

const numPlayersToRender = 10;

export default function PlayerPane() {
    const credentials = useAppSelector(state => state.login)?.credentials;
    const display = useAppSelector(state => state.display);
    const actions = displaySlice.actions;
    const dispatch = useAppDispatch();
    const gameState = useGetStateQuery()?.data;

    const { players, highlightIndex } = renderPlayers();

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
                        onRight={() => dispatch(actions.showNextPlayer())}
                        onRightRight={() => dispatch(actions.showLastPlayer())} />
                </div>
            </div>
            <div className="row">
                <div className="col">
                    <table className="table table-hover" id="players">
                        <thead>
                            <tr>
                                {['#', 'Score', 'L', 'Handle', 'K', 'D']
                                    .map((s, i) => <th key={i}>{s}</th>)}
                            </tr>
                        </thead>
                        <tbody>
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

    function renderPlayers(): { players: string[][], highlightIndex: number | null } {
        let currentPlayer = credentials?.playerId || null;
        let players = gameState?.players || [];

        let playersToRender: PlayerData[] = [];
        if (currentPlayer) playersToRender.push(players[currentPlayer]);
        if (display.highlightedPlayer && display.highlightedPlayer != currentPlayer) {
            playersToRender.push(display.highlightedPlayer);
        }

        players.sort((a, b) => b.totalScore - a.totalScore);
        players.forEach((p, i) => p.rank = i + 1);
        if (!Grownups.includes(currentPlayer)) {
            players.forEach(p => {
                if (!Grownups.includes(p.id)) return;
                p.score = new Array(p.score.length).fill(0);
            });
        }
        for (let i = this.renderPlayersFrom; i < players.length; i++) {
            let player = players[i];
            if (playersToRender.some(p => p.id == player.id)) continue;
            playersToRender.push(player);
            if (playersToRender.length >= numPlayersToRender) break;
        }
        playersToRender.sort((a, b) => a.rank - b.rank);
        return playersToRender;
    }
}
