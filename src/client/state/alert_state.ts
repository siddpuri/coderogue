import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface AlertState {
    message: string,
    kind: 'success' | 'info' | 'error',
    isShowing: boolean,
}

const initialState: AlertState = {
    message: '',
    kind: 'info',
    isShowing: false,
};

export const alertSlice = createSlice({
    name: 'alert',
    initialState,
    reducers: {
        showSuccess: show('success'),
        showInfo: show('info'),
        showError: show('error'),
        dismiss: (state) => { state.isShowing = false; },
    },
});

export const { showSuccess, showInfo, showError, dismiss } = alertSlice.actions;
export default alertSlice.reducer;

function show(kind: 'success' | 'info' | 'error') {
    return (state: AlertState, { payload }: PayloadAction<string>) => {
        state.message = payload;
        state.kind = kind;
        state.isShowing = true;
    };
}
