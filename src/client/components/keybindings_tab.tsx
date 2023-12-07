const bindings = [
    { key: 'Ctrl-S', desc: 'Submit code' },
    { key: 'Ctrl-[', desc: 'Previous tab' },
    { key: 'Ctrl-]', desc: 'Next tab' },
    { key: 'Ctrl-Shift-Left', desc: 'Show previous level' },
    { key: 'Ctrl-Shift-Right', desc: 'Show next level' },
    { key: 'Ctrl-Shift-Up', desc: 'Switch map type' },
    { key: 'Ctrl-Shift-Down', desc: 'Switch map type' },
];

export default function KeybindingsTab() {
    return <>
        <h5>Some helpful keyboard shortcuts:</h5>
        <table className="table">
            <thead>
                <tr>
                    <th className="col-3">Key</th>
                    <th>Description</th>
                </tr>
            </thead>
            <tbody>
                {bindings.map(({ key, desc }) =>
                    <tr key={key}>
                        <td><code>{key}</code></td>
                        <td>{desc}</td>
                    </tr>
                )}
            </tbody>
        </table>
    </>;
}
