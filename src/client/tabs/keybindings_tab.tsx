import React from 'react';

export default class KeybindingsTab extends React.Component {
    render() { return (<>
        <h5>Some helpful key bindings</h5>
        <table className="table">
            <thead>
                <tr>
                    <th className="col-4">Key</th>
                    <th>Description</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td><code>Ctrl-S</code></td>
                    <td>Submit code</td>
                </tr>
                <tr>
                    <td><code>Ctrl-&lbrack;</code></td>
                    <td>Previous tab</td>
                </tr>
                <tr>
                    <td><code>Ctrl-&rbrack;</code></td>
                    <td>Next tab</td>
                </tr>
                <tr>
                    <td><code>Ctrl-Up</code></td>
                    <td>Next level</td>
                </tr>
                <tr>
                    <td><code>Ctrl-Down</code></td>
                    <td>Previous level</td>
                </tr>
                <tr>
                    <td><code>Ctrl-Shift-Up</code></td>
                    <td>Show high-contrast map</td>
                </tr>
                <tr>
                    <td><code>Ctrl-Shift-Down</code></td>
                    <td>Show traditional ASCII map</td>
                </tr>
            </tbody>
        </table>
    </>);}
}
