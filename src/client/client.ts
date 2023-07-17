import ButtonHooks from './button_hooks.js';
import Credentials from './credentials.js';
import Display from './display.js';
import Updater from './updater.js';
import MonacoEditor from './monaco_editor.js';

window.onload = () => new Client().start();

export default class Client {
    readonly baseUrl = window.location.origin;
    readonly display: Display;
    readonly credentials: Credentials;
    readonly editor: MonacoEditor;
    readonly updater: Updater;
    readonly buttonHooks: ButtonHooks;

    constructor() {
        this.display = new Display(this);
        this.credentials = new Credentials(this);
        this.editor = new MonacoEditor(this);
        this.updater = new Updater(this);
        this.buttonHooks = new ButtonHooks(this);
    }

    async start(): Promise<void> {
        await this.display.start();
        await this.credentials.start();
        await this.editor.start();
        await this.updater.start();
        await this.buttonHooks.start();

        if (this.credentials.isLoggedIn) {
            this.onLogin();
        }
    }

    onLogin(): void {
        this.display.showLoggedIn();
        this.updater.loadCode();
    }

    onLogout(): void {
        this.display.showLoggedOut();
        this.updater.loadCode();
    }
}
