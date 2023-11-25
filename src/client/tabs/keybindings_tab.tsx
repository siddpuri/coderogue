const bindings = [
    { key: 'Ctrl-S', desc: 'Submit code' },
    { key: 'Ctrl-[', desc: 'Previous tab' },
    { key: 'Ctrl-]', desc: 'Next tab' },
    { key: 'Ctrl-Up', desc: 'Next level' },
    { key: 'Ctrl-Down', desc: 'Previous level' },
    { key: 'Ctrl-Shift-Up', desc: 'Show high-contrast map' },
    { key: 'Ctrl-Shift-Down', desc: 'Show traditional ASCII map' },
];

export default function KeybindingsTab() {
    return (<>
        <h5>Some helpful key bindings</h5>
        <table className="table">
            <thead>
                <tr>
                    <th className="col-4">Key</th>
                    <th>Description</th>
                </tr>
            </thead>
            <tbody>
                {bindings.map(({ key, desc }) => (
                    <tr key={key}>
                        <td><code>{key}</code></td>
                        <td>{desc}</td>
                    </tr>
                ))}
            </tbody>
        </table>
    </>);
}
