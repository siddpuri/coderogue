import Credentials from './credentials.js';
import Display from './display.js';

export default class Client {
    readonly baseUrl = window.location.origin;
    readonly display: Display;
    readonly credentials: Credentials;

    constructor() {
        this.display = new Display(this);
        this.credentials = new Credentials(this);
    }

    async start(): Promise<void> {
        await this.display.start();
        await this.credentials.start();
    }
}
