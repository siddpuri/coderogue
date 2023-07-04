export default class MonacoEditor {
    constructor(client) {
        this.client = client;
    }

    async start() {
        this.libSource = await (await fetch('coderogue.d.ts')).text();
        return new Promise(resolve => {
            require.config({ paths: { vs: 'https://unpkg.com/monaco-editor@latest/min/vs' } });
            require(['vs/editor/editor.main'], () => this.onLoad(resolve));
        });
    }
        
    onLoad(resolve) {
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
        monaco.languages.typescript.javascriptDefaults.addExtraLib(this.libSource, libUri);
        monaco.editor.createModel(this.libSource, "javascript", monaco.Uri.parse(libUri));

        const container = document.getElementById('monaco-editor-container');
        this.editor = monaco.editor.create(container, {
            automaticLayout: true,
            language: 'javascript',
            fontSize: 12,
            theme: 'vs-light',
            fixedOverflowWidgets: true,
            scrollBeyondLastLine: false,
        });

        // Redirect to Coderogue's default keybindings
        monaco.editor.addKeybindingRules(
        [
            {
                keybinding: monaco.KeyMod.CtrlCmd | monaco.KeyCode.BracketLeft,
                command: this.editor.addCommand(0, () => this.client.display.switchTab(-1)),
            },
            {
                keybinding: monaco.KeyMod.CtrlCmd | monaco.KeyCode.BracketRight,
                command: this.editor.addCommand(0, () => this.client.display.switchTab(1)),
            },
            {
                keybinding: monaco.KeyMod.CtrlCmd | monaco.KeyCode.UpArrow,
                command: this.editor.addCommand(0, () => this.client.display.switchLevel(1)),
            },
            {
                keybinding: monaco.KeyMod.CtrlCmd | monaco.KeyCode.DownArrow,
                command: this.editor.addCommand(0, () => this.client.display.switchLevel(-1)),
            },
            {
                keybinding: monaco.KeyMod.CtrlCmd | monaco.KeyMod.Shift | monaco.KeyCode.UpArrow,
                command: this.editor.addCommand(0, () => this.client.display.map.setStyle(1)),
            },
            {
                keybinding: monaco.KeyMod.CtrlCmd | monaco.KeyMod.Shift | monaco.KeyCode.DownArrow,
                command: this.editor.addCommand(0, () => this.client.display.map.setStyle(0)),
            },
        ]);

        resolve();
    }

    get code() { return this.editor.getValue(); }
    set code(code) { this.editor.setValue(code); }
    reformat() { this.editor.getAction("editor.action.formatDocument").run(); }
}
