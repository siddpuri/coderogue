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
        await fs.mkdir(this.root, { recursive: true });
    }

    async readCode(playerId) {
        try {
            return await fs.readFile(this.filePath(playerId), 'utf-8');
        } catch (e) {
            return defaultPlayerCode;
        }
    }

    async writeCode(playerId, code) {
        let filePath = this.filePath(playerId);
        await fs.mkdir(path.dirname(filePath), { recursive: true });
        await fs.writeFile(filePath, code);
    }

    filePath(playerId) {
        return path.join(this.root, playerId.toString(), 'player.js');
    }
}
