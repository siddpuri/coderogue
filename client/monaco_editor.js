export default class MonacoEditor {

    static _instance = null;

    static instance() {
        if (!MonacoEditor._instance) {
            throw new Error("Please call MonacoEditor.start() first!")
        } else {
            return MonacoEditor._instance;
        }
    }

    static async start(client, overrideDefaultKeybindings = true, monacoEditorConfig = {}) {
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
                    lib: ['es2017']
                });

                var libUri = "ts:filename/coderogue.d.ts";
                monaco.languages.typescript.javascriptDefaults.addExtraLib(libSource, libUri);
                monaco.editor.createModel(libSource, "javascript", monaco.Uri.parse(libUri));

                const container = document.getElementById('monaco-editor-container');
                MonacoEditor._instance = monaco.editor.create(container, {
                    automaticLayout: true,
                    language: 'javascript',
                    fontSize: 12,
                    theme: 'vs-dark',
                    fixedOverflowWidgets: true,
                    ...monacoEditorConfig
                });

                if (overrideDefaultKeybindings) {
                    monaco.editor.addKeybindingRules(
                    [
                        {
                            keybinding: monaco.KeyMod.CtrlCmd | monaco.KeyCode.BracketLeft,
                            command: MonacoEditor._instance.addCommand(0, () => client.display.switchTab(-1)),
                        },
                        {
                            keybinding: monaco.KeyMod.CtrlCmd | monaco.KeyCode.BracketRight,
                            command: MonacoEditor._instance.addCommand(0, () => client.display.switchTab(1)),
                        },
                        {
                            keybinding: monaco.KeyMod.CtrlCmd | monaco.KeyCode.UpArrow,
                            command: MonacoEditor._instance.addCommand(0, () => client.display.switchLevel(1)),
                        },
                        {
                            keybinding: monaco.KeyMod.CtrlCmd | monaco.KeyCode.DownArrow,
                            command: MonacoEditor._instance.addCommand(0, () => client.display.switchLevel(-1)),
                        },
                        {
                            keybinding: monaco.KeyMod.CtrlCmd | monaco.KeyMod.Shift | monaco.KeyCode.UpArrow,
                            command: MonacoEditor._instance.addCommand(0, () => client.display.switchMap(1)),
                        },
                        {
                            keybinding: monaco.KeyMod.CtrlCmd | monaco.KeyMod.Shift | monaco.KeyCode.DownArrow,
                            command: MonacoEditor._instance.addCommand(0, () => client.display.switchMap(-1)),
                        },
                    ]);
                }

                // HACK: Force the Monaco editor to relayout after initialization
                setTimeout(() => {
                    MonacoEditor._instance.layout({});
                }, 2000);

                window.onresize = () => {
                    MonacoEditor._instance.layout({});
                };

                resolve();
            });
        });
    }
}
