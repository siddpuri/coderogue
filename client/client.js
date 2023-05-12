import ButtonHooks from './button_hooks.js';
import Credentials from './credentials.js';
import Display from './display.js';
import Updater from './updater.js';

window.onload = () => new Client().start();

class Client {
    constructor() {
        this.baseUrl = window.location.origin;

        this.updater = new Updater(this);
        this.buttonHooks = new ButtonHooks(this);
        this.credentials = new Credentials(this);
        this.display = new Display(this);
    }

    async start() {
        await this.updater.start();
        await this.buttonHooks.start();
        await this.credentials.start();
        await this.display.start();

        if (this.credentials.isLoggedIn) {
            this.onLogin();
        }
    }

    onLogin() {
        this.display.showLoggedIn();
        this.updater.loadCode();
    }

    onLogout() {
        this.display.showLoggedOut();
        this.updater.loadCode();
    }
}
