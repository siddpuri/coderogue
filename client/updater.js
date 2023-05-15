export default class Updater {
    constructor(client) {
        this.client = client;
    }

    async start() {
        this.busy = false;
        this.timer = setInterval(() => this.tick(), 1000);
        await this.loadCode();
        await this.loadApi();
        await this.loadAccount();
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
        let state = await this.getJson('state');
        this.client.display.render(state);
        if (this.client.display.isShowingLogTab()) {
            await this.loadLog();
        }
    }

    async login(credentials) {
        let result = await this.postJson('login', credentials);
        if (result.error) {
            this.client.display.say(result.error, 3);
            return false;
        }
        this.client.credentials.login(result);
    }

    async loadCode() {
        let result = await this.getJson('code');
        if (result.error) {
            this.client.display.say(result.error, 3);
            return;
        }
        this.client.display.setCode(result.code);
    }

    async loadLog() {
        let result = await this.getJson('log');
        if (result.error) {
            this.client.display.say(result.error, 3);
            return;
        }
        this.client.display.setLog(result.log);
    }

    async loadApi() {
        let html = await this.getHtml('api');
        document.getElementById('api-text').innerHTML = html;
    }

    async loadAccount() {
        let html = await this.getHtml('account');
        document.getElementById('account').innerHTML = html;
    }

    async getHtml(name) {
        let response = await fetch(`${this.client.baseUrl}/${name}.html`);
        return await response.text();
    }

    async getJson(name) {
        let response = await fetch(`${this.client.baseUrl}/api/${name}`);
        let result = await response.json();
        if (result.error) {
            this.client.display.say(result.error, 3);
        }
        return result;
    }

    async postJson(name, args) {
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
}
