import { createSlice, PayloadAction } from '@reduxjs/toolkit';

const playerStep = 8;

interface DisplayState {
    style: number,
    level: number,
    coords: [number, number] | null,
    firstPlayer: number,
    showAll: boolean,
    highlightedPlayer: number | null,
    isFrozen: boolean,
}

const initialState: DisplayState = {
    style: 0,
    level: 1,
    coords: null,
    firstPlayer: 0,
    showAll: false,
    highlightedPlayer: null,
    isFrozen: false,
};

export const displaySlice = createSlice({
    name: 'display',
    initialState,
    reducers: {
        switchStyle: (state) => { state.style = 1 - state.style; },
        showLevel: (state, { payload }: PayloadAction<number>) => {
            let level: number = payload;
            state.level = level;
        },
        showFirstLevel: (state) => { state.level = 1; },
        showPrevLevel: (state) => { state.level = Math.max(state.level - 1, 1); },
        showNextLevel: (state, { payload }: PayloadAction<number>) => {
            let numLevels: number = payload;
            state.level = Math.min(state.level + 1, numLevels - 1);
        },
        showLastLevel: (state, { payload }: PayloadAction<number>) => {
            let numLevels: number = payload;
            state.level = numLevels - 1;
        },
        setCoords: (state, { payload }: PayloadAction<[number, number] | null>) => {
            let coords: [number, number] | null = payload;
            state.coords = coords;
        },
        showFirstPlayer: (state) => {
            state.firstPlayer = 0;
        },
        showPrevPlayer: (state) => {
            state.firstPlayer = Math.max(state.firstPlayer - playerStep, 0);
        },
        showNextPlayer: (state, { payload }: PayloadAction<number>) => {
            let numPlayers: number = payload;
            state.firstPlayer = Math.min(state.firstPlayer + playerStep, numPlayers - playerStep);
        },
        showLastPlayer: (state, { payload }: PayloadAction<number>) => {
            let numPlayers: number = payload;
            state.firstPlayer = numPlayers - playerStep;
        },
        setShowAll: (state, { payload }: PayloadAction<boolean>) => {
            let showAll: boolean = payload;
            state.showAll = showAll;
        },
        highlightPlayer: (state, { payload }: PayloadAction<number | null>) => {
            let playerToHighlight: number | null = payload;
            if (state.highlightedPlayer == playerToHighlight) playerToHighlight = null;
            state.highlightedPlayer = playerToHighlight;
        },
        freeze: (state) => { state.isFrozen = true; },
        unfreeze: (state) => { state.isFrozen = false; },
    },
});
