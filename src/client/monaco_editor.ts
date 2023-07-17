import Client from './client.js';

/* eslint-disable @typescript-eslint/no-explicit-any */
declare class monaco {
    static languages: any;
    static editor: any;
    static Uri: any;
    static KeyMod: any;
    static KeyCode: any;
}

declare const require: any;
/* eslint-enable @typescript-eslint/no-explicit-any */

export default class MonacoEditor {
    libSource!: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    editor!: any;

    constructor(
        private readonly client: Client
    ) {}

    async start(): Promise<void> {
        this.libSource = await (await fetch('coderogue.d.ts')).text();
        return new Promise(resolve => {
            require.config({ paths: { vs: 'https://unpkg.com/monaco-editor@latest/min/vs' } });
            require(['vs/editor/editor.main'], () => this.onLoad(resolve));
        });
    }
    
    onLoad(resolve: () => void): void {
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

        const libUri = 'ts:filename/coderogue.d.ts';
        monaco.languages.typescript.javascriptDefaults.addExtraLib(this.libSource, libUri);
        monaco.editor.createModel(this.libSource, 'javascript', monaco.Uri.parse(libUri));

        const container = document.getElementById('monaco-editor-container') as HTMLElement;
        this.editor = monaco.editor.create(container, {
            automaticLayout: true,
            language: 'javascript',
            fontSize: 12,
            theme: 'vs-light',
            fixedOverflowWidgets: true,
            scrollBeyondLastLine: false,
            minimap: { enabled: false },
        });

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        let symbols: { [key: string]: any } = {
            'C': monaco.KeyMod.CtrlCmd,
            'S': monaco.KeyMod.Shift,
            's': monaco.KeyMod.KeyS,
            '[': monaco.KeyCode.BracketLeft,
            ']': monaco.KeyCode.BracketRight,
            'ArrowUp': monaco.KeyCode.UpArrow,
            'ArrowDown': monaco.KeyCode.DownArrow,
        };

        let bindings = [];
        for (let key in this.client.display.keybindings) {
            bindings.push({
                keybinding: key.split('-').reduce((acc, val) => acc | symbols[val], 0),
                command: this.editor.addCommand(0, this.client.display.keybindings[key]),
            });
        }
        monaco.editor.addKeybindingRules(bindings);

        resolve();
    }

    get code() { return this.editor.getValue(); }
    set code(code) { this.editor.setValue(code); }

    reformat(): void {
        this.editor.getAction('editor.action.formatDocument').run();
    }
}
