import { configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/dist/query';

import { serverApi } from './client/server_api';

import { alertSlice } from './state/alert_state';
import { displaySlice } from './state/display_state';
import { loginSlice } from './state/login_state';

export const store = configureStore({
    reducer: {
        [serverApi.reducerPath]: serverApi.reducer,
        alert: alertSlice.reducer,
        display: displaySlice.reducer,
        login: loginSlice.reducer,
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: { warnAfter: 128 },
        })
            .concat(serverApi.middleware)
});

setupListeners(store.dispatch);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
