import path from 'path';
import fs from 'fs/promises';

import Server from './server.js';

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
    root = playerRoot;

    constructor(
        readonly server: Server
    ) {
        if (this.root.startsWith('~/') && process.env.HOME) {
            this.root = path.join(process.env.HOME, this.root.slice(2));
        }
    }

    async start(): Promise<void> {
        await fs.mkdir(this.root, { recursive: true });
    }

    async readCode(playerId: number): Promise<string> {
        try {
            return await fs.readFile(this.filePath(playerId), 'utf-8');
        } catch (e) {
            return defaultPlayerCode;
        }
    }

    async writeCode(playerId: number, code: string): Promise<void> {
        let filePath = this.filePath(playerId);
        await fs.mkdir(path.dirname(filePath), { recursive: true });
        await fs.writeFile(filePath, code);
    }

    private filePath(playerId: number): string {
        return path.join(this.root, playerId.toString(), 'player.js');
    }
}
