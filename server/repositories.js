import path from 'path';
import fs from 'fs';

export default class Repositories {
    constructor(server) {
        this.server = server;
        this.root = this.server.settings.playerRoot;
        if (this.root.startsWith('~/')) {
            this.root = path.join(process.env.HOME, this.root.slice(2));
        }
        console.log(this.root);
    }

    start() {
        if (!fs.existsSync(this.root)) {
            fs.mkdirSync(this.root);
        }
    }
}