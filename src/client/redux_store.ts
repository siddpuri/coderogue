import { configureStore } from '@reduxjs/toolkit';

import loginReducer from './state/login_state';
import alertReducer from './state/alert_state';

export const store = configureStore({
    reducer: {
        login: loginReducer,
        alert: alertReducer,
    },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
