export default class MonacoEditor {

    static _instance = null;

    static instance() {
        if (!MonacoEditor._instance) {
            throw new Error("Please call MonacoEditor.start() first!")
        } else {
            return MonacoEditor._instance;
        }
    }

    static async start(config = {}) {
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

                MonacoEditor._instance = monaco.editor.create(document.getElementById('monaco-editor'), {
                    automaticLayout: true,
                    language: 'javascript',
                    fontSize: 12,
                    theme: 'vs-dark',
                    ...config
                });

                window.onresize = () => {
                    MonacoEditor._instance.layout({});
                }

                resolve();
            });
        });
    }
}
