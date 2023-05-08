import ButtonHooks from './button_hooks.js';
import Credentials from './credentials.js';
import Display from './display.js';
import Updater from './updater.js';

class Client {
    constructor() {
        this.baseUrl = window.location.origin;
        this.buttonHooks = new ButtonHooks(this);
        this.credentials = new Credentials(this);
        this.display = new Display(this);
        this.updater = new Updater(this);
    }

    start() {
        this.buttonHooks.start();
        this.display.showLoadingScreen();
        this.updater.start();
    }
}

window.onload = async function() {
    new Client().start();
}
