import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { StateResponse } from '../../shared/protocol.js';

export const serverApi = createApi({
    reducerPath: 'serverApi',
    baseQuery: fetchBaseQuery({ baseUrl: 'api' }),
    endpoints: (build) => ({
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
            query: (code) => ({ url: 'code', method: 'POST', body: { code } }),
        }),
        respawn: build.mutation<void, void>({
            query: () => ({ url: 'respawn', method: 'POST' }),
        }),
    }),
});

export const {
    useGetStateQuery,
    useLoadCodeQuery,
    useLoadLogQuery,
    useSubmitCodeMutation,
    useRespawnMutation
} = serverApi;
