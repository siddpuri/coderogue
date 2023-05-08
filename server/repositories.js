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

    async readPlayerCode(playerHandle) {
        const file = path.join(this.root, playerHandle, 'player.js');
        try {
            const code = await fs.readFile(file, 'utf-8');
            console.log("Loaded code from: " + file);
            return code;
        } catch (e) {
            return await this.readPlayerCode('default');
        }
    }
}
