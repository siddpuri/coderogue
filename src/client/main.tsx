import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import Page from './page';

const root = createRoot(document.getElementById('root') as HTMLElement);
root.render(
    <StrictMode>
        <Page />
    </StrictMode>
);
