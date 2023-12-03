import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

import type { LoginRequest, LoginResponse, StateResponse } from '../../shared/protocol';

export const serverApi = createApi({
    reducerPath: 'serverApi',
    baseQuery: fetchBaseQuery({ baseUrl: 'api' }),
    endpoints: build => ({
        login: build.mutation<LoginResponse, LoginRequest>({
            query: credentials => ({ url: 'login', method: 'POST', body: credentials }),
        }),
        getState: build.query<StateResponse, void>({
            query: () => 'state',
        }),
        loadCode: build.query<string, void>({
            query: () => 'code',
        }),
        loadLog: build.query<string, void>({
            query: () => 'log',
        }),
        submitCode: build.mutation<void, string>({
            query: code => ({ url: 'code', method: 'POST', body: { code } }),
        }),
        respawn: build.mutation<void, void>({
            query: () => ({ url: 'respawn', method: 'POST' }),
        }),
    }),
});

export const {
    useLoginMutation,
    useGetStateQuery,
    useLoadCodeQuery,
    useLoadLogQuery,
    useSubmitCodeMutation,
    useRespawnMutation,
} = serverApi;
