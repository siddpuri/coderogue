import { LoginRequest, LoginResponse, ErrorResponse } from '../shared/protocol.js';

import Client from './client.js';

export default class Updater {
    private busy = false;

    constructor(
        private readonly client: Client
    ) {
        setInterval(() => this.tick(), 1000);
    }

    async start() {
        await this.loadCode();
        await this.loadHtml('general', 'general-text');
        await this.loadHtml('news', 'news-text');
        await this.loadHtml('api', 'api-text');
        await this.loadHtml('levels', 'levels-text');
        await this.loadHtml('keybindings', 'keybindings-text');
        await this.loadHtml('account', 'account');
    }

    private element(id: string) {
        return document.getElementById(id) as HTMLElement;
    }

    async tick() {
        if (this.busy) {
            console.log('Missed a tick.');
            return;
        }
        this.busy = true;
        try {
            await this.doTickActions();
        } finally {
            this.busy = false;
        }
    }

    async doTickActions() {
        this.client.display.setState(await this.getJson('state'));
        if (this.client.display.isShowing('log-tab')) {
            await this.loadLog();
        }
    }

    async login(loginData: LoginRequest) {
        let result: LoginResponse | ErrorResponse = await this.postJson('login', loginData);
        if ((result as ErrorResponse).error) return false;
        this.client.credentials.onLogin(result as LoginResponse);
    }

    async loadCode() {
        let code = 'Log in to see your code.'
        if (this.client.credentials.isLoggedIn) {
            let result = await this.getJson('code');
            if (!result.error) code = result.code;
        }
        this.client.display.setCode(code);
    }

    async loadLog() {
        let log = 'Log in to see your log.';
        if (this.client.credentials.isLoggedIn) {
            if (this.client.display.logIsFrozen) return;
            let result = await this.getJson('log');
            if (!result.error) log = result.log;
        }
        this.client.display.setLog(log);
    }

    async getJson(name: string) {
        let response = await fetch(`${this.client.baseUrl}/api/${name}`);
        let result = await response.json();
        if (result.error) {
            this.client.display.say(result.error, 3);
        }
        return result;
    }

    async postJson(name: string, args: Object) {
        let response = await fetch(
            `${this.client.baseUrl}/api/${name}`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(args),
            }
        );
        let result = await response.json();
        if (result.error) {
            this.client.display.say(result.error, 3);
        }
        return result;
    }

    async loadHtml(name: string, id: string) {
        let response = await fetch(`${this.client.baseUrl}/${name}.html`);
        let html = await response.text();
        this.element(id).innerHTML = html;
    }
}
