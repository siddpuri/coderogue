import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { useGetStateQuery } from '../client/server_api';

const playerStep = 8;

interface DisplayState {
    style: number,
    level: number,
    coords: [number, number] | null,
    firstPlayer: number,
    highlightedPlayer: number | null,
}

const initialState: DisplayState = {
    style: 0,
    level: 1,
    coords: null,
    firstPlayer: 0,
    highlightedPlayer: null,
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
        setCoords: (state, { payload }: PayloadAction<[number, number] | null>) => {
            state.coords = payload;
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
        highlightPlayer: (state, { payload }: PayloadAction<number | null>) => {
            if (payload === state.highlightedPlayer) payload = null;
            state.highlightedPlayer = payload;
        },
    },
});
