import { createSlice } from '@reduxjs/toolkit';

import { useGetStateQuery } from '../client/server_api';

const playerStep = 8;

interface DisplayState {
    style: number,
    level: number,
    firstPlayer: number,
    highlightedPlayerId: number | null,
}

const initialState: DisplayState = {
    style: 0,
    level: 1,
    firstPlayer: 0,
    highlightedPlayerId: null,
};

export const displaySlice = createSlice({
    name: 'display',
    initialState,
    reducers: {
        setPrevStyle: (state) => { state.style = 0; },
        setNextStyle: (state) => { state.style = 1; },
        showFirstLevel: (state) => { state.level = 1; },
        showPrevLevel: (state) => {
            state.level = Math.max(state.level - 1, 1);
        },
        showNextLevel: (state) => {
            let gameState = useGetStateQuery(undefined)?.data;
            if (!gameState) return;
            state.level = Math.min(state.level + 1, gameState.levels.length);
        },
        showLastLevel: (state) => {
            let gameState = useGetStateQuery(undefined)?.data;
            if (!gameState) return;
            state.level = gameState.levels.length;
        },
        showFirstPlayer: (state) => { state.firstPlayer = 0; },
        showPrevPlayer: (state) => {
            state.firstPlayer = Math.max(state.firstPlayer - playerStep, 0);
        },
        showNextPlayer: (state) => {
            let gameState = useGetStateQuery(undefined)?.data;
            if (!gameState) return;
            state.firstPlayer = Math.min(state.firstPlayer + playerStep, gameState.players.length - playerStep);
        },
        showLastPlayer: (state) => {
            let gameState = useGetStateQuery(undefined)?.data;
            if (!gameState) return;
            state.firstPlayer = gameState.players.length - playerStep;
        },
    },
});
