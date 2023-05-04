import path from 'path';
import fs from 'fs/promises';

const playerRoot =  '~/players';

export default class Repositories {
    constructor(server) {
        this.server = server;
        this.root = playerRoot;
        if (this.root.startsWith('~/')) {
            this.root = path.join(process.env.HOME, this.root.slice(2));
        }
    }

    async start() {
        await fs.mkdir(this.root, {recursive: true});
    }

    async readPlayerCode(player) {
        const file = path.join(this.root, player.textHandle, 'player.js');
        console.log("Loading code from: " + file);
        try {
            return await fs.readFile(file, 'utf-8');
        } catch (e) {
            return '';
        }
    }
}