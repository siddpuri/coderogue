import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { StateResponse } from '../../shared/protocol.js';

interface GameState {
    state: StateResponse | null,
    log: string,
}

const initialState: GameState = {
    state: null,
    log: '',
};

export const gameSlice = createSlice({
    name: 'game',
    initialState,
    reducers: {
        updateState: (state, { payload }: PayloadAction<StateResponse>) => {
            state.state = payload;
        },
        updateLog: (state, { payload }: PayloadAction<string>) => {
            state.log = payload;
        },
    },
});

export const { updateState, updateLog } = gameSlice.actions;
export default gameSlice.reducer;
