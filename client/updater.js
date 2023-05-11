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
        await this.doTickActions();
        this.busy = false;
    }

    async doTickActions() {
        let response = await fetch(this.client.baseUrl + "/api/state");
        let state = await response.json();
        this.client.display.render(state);
        if (this.client.display.isShowingLogTab()) {
            await this.loadLog();
        }
    }

    async loadCode() {
        let code = 'Log in to see your code.';
        if (this.client.credentials.isLoggedIn) {
            let response = await fetch(this.client.baseUrl + "/api/code");
            let result = await response.json();
            if (result.error) {
                this.client.display.say(result.error, 3);
                return;
            }
            code = result.code;
        }
        this.client.display.setCode(code);
    }

    async loadLog() {
        let log = 'Log in to see your log.';
        if (this.client.credentials.isLoggedIn) {
            let response = await fetch(this.client.baseUrl + "/api/log");
            let result = await response.json();
            if (result.error) {
                this.client.display.say(result.error, 3);
                return;
            }
            log = result.log;
        }
        this.client.display.setLog(log);
    }

    async loadApi() {
        let response = await fetch(this.client.baseUrl + "/api.html");
        document.getElementById('api-text').innerHTML = await response.text();
    }

    async loadAccount() {
        let response = await fetch(this.client.baseUrl + "/account.html");
        document.getElementById('account').innerHTML = await response.text();
    }
}
