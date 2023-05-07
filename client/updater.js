export default class Updater {
    constructor(baseUrl, display) {
        this.baseUrl = baseUrl;
        this.display = display;
    }

    start() {
        this.busy = false;
        this.timer = setInterval(() => this.tick(), 1000);
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
        let response = await fetch(this.baseUrl + "/api/state");
        let state = await response.json();
        this.display.render(state);
    }
}
