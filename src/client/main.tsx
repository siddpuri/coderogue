import React from 'react';
import ReactDOM from 'react-dom/client';
import 'bootstrap/dist/css/bootstrap.min.css';
import './coderogue.css';
import Page from './page';
import Client from './client';

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <Page />
    </React.StrictMode>,
);

window.onload = () => new Client().start();
