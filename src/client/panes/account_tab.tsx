import { useRef, useState } from 'react';
import { Form, Stack, InputGroup, Button } from 'react-bootstrap';

import { useAppSelector, useAppDispatch } from '../client/redux_hooks';

import { useLoginMutation } from '../state/server_api';
import { loginSlice } from '../state/login_state';
import { alertSlice } from '../state/alert_state';

import { LoginResponse, ErrorResponse } from '../../shared/protocol';

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
            <Stack gap={3} className="col-3">
                <div>Log in or create a new account.</div>
                <InputGroup>
                    <Form.Control
                        placeholder="s-yourname"
                        onChange={e => setEmailValue(e.target.value)}
                        onKeyDown={e => e.key == "Enter" && passwordRef.current!.focus() }
                    />
                    <InputGroup.Text>@lwsd.org</InputGroup.Text>
                </InputGroup>
                <Form.Control
                    ref={passwordRef}
                    type="password"
                    placeholder="Password"
                    onChange={e => setPasswordValue(e.target.value)}
                    onKeyDown={e => e.key == "Enter" && login()}
                />
                <Button onClick={login}>Log in / Register</Button>
            </Stack>
        </>;
    }

    function logoutForm() {
        return <>
            <Stack gap={3} className="col-3">
                <div>You are logged in as {credentials!.textHandle}.</div>
                <Button onClick={logout}>Log out</Button>
            </Stack>
        </>;
    }

    function login() {
        sendLogin({ email: emailValue, password: passwordValue })
            .unwrap()
            .then(response => {
                if (response.hasOwnProperty('error')) {
                    dispatch(alertSlice.actions.showError((response as ErrorResponse).error));
                } else {
                    dispatch(loginSlice.actions.login(response as LoginResponse));
                    dispatch(alertSlice.actions.showSuccess('Logged in'));
                }
            })
    }

    function logout() {
        setEmailValue('');
        setPasswordValue('');
        dispatch(loginSlice.actions.logout());
        dispatch(alertSlice.actions.showSuccess('Logged out'));
    }
}
