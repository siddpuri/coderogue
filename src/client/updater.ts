import {
    LoginRequest,
    LoginResponse,
    CodeResponse,
    LogResponse,
    StateResponse,
} from '../shared/protocol.js';

import Client from './client.js';
import Fetcher from './fetcher.js';

export default class Updater {
    private fetcher: Fetcher;
    private busy = false;

    constructor(
        private readonly client: Client
    ) {
        this.fetcher = new Fetcher(client);
        setInterval(() => this.tick(), 1000);
    }

    async start(): Promise<void> {
        await this.loadCode();
        await this.loadHtml('general', 'general-text');
        await this.loadHtml('news', 'news-text');
        await this.loadHtml('api', 'api-text');
        await this.loadHtml('levels', 'levels-text');
        await this.loadHtml('keybindings', 'keybindings-text');
        await this.loadHtml('account', 'account');
    }

    private element(id: string): HTMLElement {
        return document.getElementById(id) as HTMLElement;
    }

    async tick(): Promise<void> {
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

    async doTickActions(): Promise<void> {
        let result = await this.fetcher.getJson<StateResponse>('state');
        if (result) this.client.display.setState(result);
        if (this.client.display.isShowing('log-tab')) {
            await this.loadLog();
        }
    }

    async login(loginData: LoginRequest): Promise<void> {
        let result = await this.fetcher.postJson<LoginResponse>('login', loginData);
        if (result) this.client.credentials.onLogin(result);
    }

    async loadCode(): Promise<void> {
        let code = 'Log in to see your code.';
        if (this.client.credentials.isLoggedIn) {
            let result = await this.fetcher.getJson<CodeResponse>('code');
            if (result) code = result.code;
        }
        this.client.display.setCode(code);
    }

    async loadLog(): Promise<void> {
        let log = 'Log in to see your log.';
        if (this.client.credentials.isLoggedIn) {
            if (this.client.display.logIsFrozen) return;
            let result = await this.fetcher.getJson<LogResponse>('log');
            if (result) log = result.log;
        }
        this.client.display.setLog(log);
    }

    async loadHtml(name: string, id: string): Promise<void> {
        let result = await this.fetcher.getText(name + '.html');
        this.element(id).innerHTML = result;
    }
}
