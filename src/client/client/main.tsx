import { createRoot } from 'react-dom/client';
import { StrictMode } from 'react';
import { Provider } from 'react-redux';

import { store } from './redux_store';
import Page from '../panes/page';

const root = createRoot(document.getElementById('root') as HTMLElement);
root.render(
    <StrictMode>
        <Provider store={store}>
            <Page />
        </Provider>
    </StrictMode>
);
