import path from 'path';
import fs from 'fs/promises';

const playerRoot =  '~/players';

const defaultPlayerCode =
`// Random walk
if (randomNumber(0, 3)) {
    moveForward();
}
else if (randomNumber(0, 1)) {
    turnRight();
}
else {
    turnLeft();
}`;

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

    async readCode(playerId) {
        const file = path.join(this.root, playerId.toString(), 'player.js');
        try {
            const code = await fs.readFile(file, 'utf-8');
            console.log("Loaded code from: " + file);
            return code;
        } catch (e) {
            console.log("Using default code for player: " + playerId);
            return defaultPlayerCode;
        }
    }
}
