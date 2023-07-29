import { createSlice } from '@reduxjs/toolkit';

import { LoginResponse } from '../../shared/protocol.js';

const expire_never = ';expires=Fri, 31 Dec 9999 23:59:59 GMT';
const expire_now = ';expires=Thu, 01 Jan 1970 00:00:00 GMT';

export const loginSlice = createSlice({
    name: 'login',
    initialState: {
        credentials: readCookie(),
    },
    reducers: {
        onLogin: (state, { payload }: { payload: LoginResponse }) => {
            state.credentials = payload;
            writeCookie('playerId', payload.playerId);
            writeCookie('authToken', payload.authToken);
            writeCookie('textHandle', payload.textHandle);
        },

        onLogout: (state) => {
            state.credentials = null;
            deleteCookie('playerId');
            deleteCookie('authToken');
            deleteCookie('textHandle');
        },
    },
});

export const { onLogin, onLogout } = loginSlice.actions;
export default loginSlice.reducer;

function readCookie(): LoginResponse | null {
    let credentials = {} as LoginResponse;
    let cookies = document.cookie.split('; ');
    for (let cookie of cookies) {
        let [name, value] = cookie.split('=');
        switch (name) {
        case 'playerId': credentials.playerId = Number(value); break;
        case 'authToken': credentials.authToken = value; break;
        case 'textHandle': credentials.textHandle = value; break;
        }
    }
    let isValid = credentials.playerId && credentials.authToken && credentials.textHandle;
    return isValid ? credentials : null;
}

function writeCookie(key: string, value: string | number): void {
    document.cookie = `${key}=${value}${expire_never}`;
}

function deleteCookie(key: string): void {
    document.cookie = `${key}=;${expire_now}`;
}
