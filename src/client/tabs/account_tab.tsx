import React from 'react';

export default class AccountTab extends React.Component {
    render() { return (<>
        <form id="login-form">
            <div className="row mb-3">
                <label>
                    You can use this either to log in or to register a new account.
                </label>
            </div>
            <div className="row mb-3">
                <div className="col-3">
                    <div className="input-group">
                        <input type="text" className="form-control" id="email" placeholder="s-jsmith" />
                        <div className="input-group-append">
                            <span className="input-group-text">@lwsd.org</span>
                        </div>
                    </div>
                </div>
                <div className="col-3">
                    <input type="password" className="form-control" id="password" placeholder="Password" />
                </div>
            </div>
            <div className="row mb-3">
                <div className="d-grid col-2">
                    <button type="button" className="btn btn-primary" id="login">Log in / Register</button>
                </div>
            </div>
        </form>

        <form className="d-none" id="logout-form">
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
    </>);}
}
