import LookupTable from '../components/lookup_table'

const entries = [
    { line: 'Ctrl-S', desc: 'Submit code' },
    { line: 'Ctrl-[', desc: 'Previous tab' },
    { line: 'Ctrl-]', desc: 'Next tab' },
    { line: 'Ctrl-Shift-Left', desc: 'Show previous level' },
    { line: 'Ctrl-Shift-Right', desc: 'Show next level' },
    { line: 'Ctrl-Shift-Up', desc: 'Switch map type' },
    { line: 'Ctrl-Shift-Down', desc: 'Switch map type' },
];

export default function KeybindingsTab() {
    return LookupTable({
        name: 'Keyboard shortcuts',
        header: 'Key',
        body: entries,
    });
}
