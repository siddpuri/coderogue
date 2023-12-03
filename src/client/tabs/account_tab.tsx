import { useRef, useState } from 'react';

import { useAppSelector, useAppDispatch } from '../client/redux_hooks';

import { useLoginMutation } from '../state/server_api';
import { loginSlice } from '../state/login_state';

export default function AccountTab() {
    const [sendLogin, _credentials] = useLoginMutation();
    const credentials = useAppSelector(state => state.login?.credentials ?? null);
    const dispatch = useAppDispatch();

    const passwordRef = useRef<HTMLInputElement>(null);

    const [emailValue, setEmailValue] = useState('');
    const [passwordValue, setPasswordValue] = useState('');

    const currentPlayer = credentials?.playerId ?? null;
    return currentPlayer ? logoutForm() : loginForm();

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
                            onKeyDown={e => { if (e.key == "Enter") passwordRef.current!.focus() }}
                        />
                        <span className="input-group-text">@lwsd.org</span>
                    </div>
                </div>
                <div className="col-3">
                    <input
                        ref={passwordRef}
                        type="password"
                        className="form-control"
                        placeholder="Password"
                        onChange={e => setPasswordValue(e.target.value)}
                        onKeyDown={e => { if (e.key == "Enter") login(); }}
                    />
                </div>
            </div>
            <div className="row mb-3">
                <div className="d-grid col-2">
                    <button type="button" className="btn btn-primary" onClick={login}>
                        Log in / Register
                    </button>
                </div>
            </div>
        </>;
    }

    function logoutForm() {
        return <>
            <form id="logout-form">
                <div className="row mb-3">
                    <label>
                        You are logged in as {credentials!.textHandle}.
                    </label>
                </div>
                <div className="row mb-3">
                    <div className="d-grid col-2">
                        <button type="button" className="btn btn-primary" onClick={logout}>
                            Log out
                        </button>
                    </div>
                </div>
            </form>
        </>;
    }

    function login() {
        sendLogin({ email: emailValue, password: passwordValue });
    }

    function logout() {
        dispatch(loginSlice.actions.logout());
    }
}
