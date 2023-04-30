import path from 'path';
import fs from 'fs/promises';

export default class Repositories {
    constructor(server) {
        this.server = server;
        this.root = this.server.settings.playerRoot;
        if (this.root.startsWith('~/')) {
            this.root = path.join(process.env.HOME, this.root.slice(2));
        }
        console.log(this.root);
    }

    async start() {
        await fs.mkdir(this.root, {recursive: true});
    }

    async readPlayerCode(player) {
        const file = path.join(this.root, player.textHandle, 'player.js');
        try {
            return await fs.readFile(file, 'utf-8');
        } catch (e) {
            return '';
        }
    }
}