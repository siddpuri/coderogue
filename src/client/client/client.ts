import Display from './display.js';

export default class Client {
    readonly baseUrl = window.location.origin;
    readonly display: Display;

    constructor() {
        this.display = new Display(this);
    }

    async start(): Promise<void> {
        await this.display.start();
    }
}
