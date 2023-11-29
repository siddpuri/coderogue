import { useState } from 'react';
import { useAppSelector, useAppDispatch } from '../redux_hooks';

import { useLoginMutation } from '../client/server_api.js';

import { loginSlice } from '../state/login_state';

export default function AccountTab() {
    const [sendLogin, loginResult] = useLoginMutation();
    const credentials = useAppSelector(state => state.login?.credentials ?? null);
    const actions = loginSlice.actions;
    const dispatch = useAppDispatch();

    const [emailValue, setEmailValue] = useState('');
    const [passwordValue, setPasswordValue] = useState('');

    const currentPlayer = credentials?.playerId ?? null;
    return currentPlayer? logoutForm() : loginForm();

    function loginForm() {
        return <>
            <div className="row mb-3">
                <label>
                    Log in or create a new account.
                </label>
            </div>
            <div className="row mb-3">
                <div className="col-3">
                    <div className="input-group">
                        <input
                            type="text"
                            className="form-control"
                            placeholder="s-jsmith"
                            onChange={e => setEmailValue(e.target.value)}
                            onKeyDown={e => { if (e.key == "Enter") {} }} />
                        <span className="input-group-text">@lwsd.org</span>
                    </div>
                </div>
                <div className="col-3">
                    <input
                        type="password"
                        className="form-control"
                        placeholder="Password"
                        onChange={e => setPasswordValue(e.target.value)}
                        onKeyDown={e => { if (e.key == "Enter") login(); }} />
                </div>
            </div>
            <div className="row mb-3">
                <div className="d-grid col-2">
                    <button type="button" className="btn btn-primary">Log in / Register</button>
                </div>
            </div>
        </>;
    }

    async function login() {
        let response = await sendLogin({ email: emailValue, password: passwordValue });
        if (response.hasOwnProperty('data')) {
            console.log(response.data as LoginResponse);
            return;
        }
        else {
            alert;
        }
    }

    function isSuccessfulLogin(response: LoginResponse | )

    function logoutForm() {
        return (
            <form id="logout-form">
                <div className="row mb-3">
                    <label>
                        You are logged in as <span id="user-handle"></span>.
                    </label>
                </div>
                <div className="row mb-3">
                    <div className="d-grid col-2">
                        <button type="button" className="btn btn-primary" id="logout">Log out</button>
                    </div>
                </div>
            </form>
        );
    }
}
