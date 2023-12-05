import { createSlice, PayloadAction } from '@reduxjs/toolkit';

const timeout = 1000;

interface AlertState {
    message: string,
    kind: 'success' | 'info' | 'error',
    isShowing: boolean,
    timeToDismiss: number,
}

const initialState: AlertState = {
    message: '',
    kind: 'info',
    isShowing: false,
    timeToDismiss: 0,
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

function show(kind: 'success' | 'info' | 'error') {
    return (state: AlertState, { payload }: PayloadAction<string>) => {
        state.message = payload;
        state.kind = kind;
        state.isShowing = true;
        state.timeToDismiss = Date.now() + timeout;
    };
}
