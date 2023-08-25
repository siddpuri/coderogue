import { configureStore } from '@reduxjs/toolkit';

import alertReducer from './state/alert_state';
import gameReducer from './state/game_state';
import loginReducer from './state/login_state';

export const store = configureStore({
    reducer: {
        alert: alertReducer,
        gameState: gameReducer,
        login: loginReducer,
    },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
