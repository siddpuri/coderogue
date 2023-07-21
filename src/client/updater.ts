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
}
