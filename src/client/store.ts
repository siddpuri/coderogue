import { configureStore } from '@reduxjs/toolkit';

import loginReducer from './state/login_state';

export default configureStore({
    reducer: {
        login: loginReducer,
    },
});
