export default class Updater {
    constructor(client) {
        this.client = client;
    }

    start() {
        this.busy = false;
        this.timer = setInterval(() => this.tick(), 1000);
        this.loadCode();
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
    }

    async loadCode() {
        let response = await fetch(this.client.baseUrl + "/api/code");
        let code = await response.json();
        this.client.display.setCode(code);
    }
}
