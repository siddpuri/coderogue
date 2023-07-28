import ButtonHooks from './button_hooks.js';
import Credentials from './credentials.js';
import Display from './display.js';

export default class Client {
    readonly baseUrl = window.location.origin;
    readonly display: Display;
    readonly credentials: Credentials;
    readonly buttonHooks: ButtonHooks;

    constructor() {
        this.display = new Display(this);
        this.credentials = new Credentials(this);
        this.buttonHooks = new ButtonHooks(this);
    }

    async start(): Promise<void> {
        await this.display.start();
        await this.credentials.start();
        await this.buttonHooks.start();

        if (this.credentials.isLoggedIn) {
            this.onLogin();
        }
    }

    onLogin(): void {
        this.display.showLoggedIn();
    }

    onLogout(): void {
        this.display.showLoggedOut();
    }
}
