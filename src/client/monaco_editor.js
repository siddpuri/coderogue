export default class MonacoEditor {
    constructor(client) {
        this.client = client;
    }

    async start(client, overrideDefaultKeybindings = true, monacoEditorConfig = {}) {
        const libSource = await (await fetch('coderogue.d.ts')).text();
        return new Promise(resolve => {
            require.config({ paths: { vs: 'https://unpkg.com/monaco-editor@latest/min/vs' } });
            require(['vs/editor/editor.main'], () => {
                monaco.languages.typescript.javascriptDefaults.setDiagnosticsOptions({
                    noSemanticValidation: false,
                    noSuggestionDiagnostics: true,
                    noSyntaxValidation: false,
                });

                monaco.languages.typescript.javascriptDefaults.setCompilerOptions({
                    target: monaco.languages.typescript.ScriptTarget.ES2017,
                    allowNonTsExtensions: true,
                    lib: ['es2017'],  // Vanilla JS, no DOM stuff.
                });

                var libUri = "ts:filename/coderogue.d.ts";
                monaco.languages.typescript.javascriptDefaults.addExtraLib(libSource, libUri);
                monaco.editor.createModel(libSource, "javascript", monaco.Uri.parse(libUri));

                const container = document.getElementById('monaco-editor-container');
                this.editor = monaco.editor.create(container, {
                    automaticLayout: true,
                    language: 'javascript',
                    fontSize: 12,
                    theme: 'vs-dark',
                    fixedOverflowWidgets: true,
                    scrollBeyondLastLine: false,
                    ...monacoEditorConfig
                });

                if (overrideDefaultKeybindings) {
                    // Redirect to Coderogue's default keybindings
                    monaco.editor.addKeybindingRules(
                    [
                        {
                            keybinding: monaco.KeyMod.CtrlCmd | monaco.KeyCode.BracketLeft,
                            command: this.editor.addCommand(0, () => client.display.switchTab(-1)),
                        },
                        {
                            keybinding: monaco.KeyMod.CtrlCmd | monaco.KeyCode.BracketRight,
                            command: this.editor.addCommand(0, () => client.display.switchTab(1)),
                        },
                        {
                            keybinding: monaco.KeyMod.CtrlCmd | monaco.KeyCode.UpArrow,
                            command: this.editor.addCommand(0, () => client.display.switchLevel(1)),
                        },
                        {
                            keybinding: monaco.KeyMod.CtrlCmd | monaco.KeyCode.DownArrow,
                            command: this.editor.addCommand(0, () => client.display.switchLevel(-1)),
                        },
                        {
                            keybinding: monaco.KeyMod.CtrlCmd | monaco.KeyMod.Shift | monaco.KeyCode.UpArrow,
                            command: this.editor.addCommand(0, () => client.display.map.setStyle(1)),
                        },
                        {
                            keybinding: monaco.KeyMod.CtrlCmd | monaco.KeyMod.Shift | monaco.KeyCode.DownArrow,
                            command: this.editor.addCommand(0, () => client.display.map.setStyle(0)),
                        },
                    ]);
                }

                resolve();
            });
        });
    }

    get code() { return this.editor.getValue(); }
    set code(code) { this.editor.setValue(code); }
    reformat() { this.editor.getAction("editor.action.formatDocument").run(); }
}
