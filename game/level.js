import Cell from './cell.js';

export default class Level {
    constructor(width, height) {
        this.width = width;
        this.height = height;
        this.map =
            Array(height).fill().map(() =>
                Array(width).fill().map(() =>
                    new Cell()));
        this.players = {};
    }
    
    get spawnTarget() { return [10, 10]; }

    get finishPoint() { return [this.width - 10, this.height - 10]; }

    getSpawnPoint() {
        let candidates = [];
        let [x0, y0] = this.spawnTarget;
        for (let x = x0 - 10; x <= x0 + 10; x0++) {
            for (let y = y0 - 10; y <= y0 + 10; y0++) {
                if (!this.getCell(x, y).mob) {
                    candidates.push([x, y]);
                }
            }
        }
        if (candidates.length == 0) {
            return null;
        }
        return candidates[Math.floor(Math.random() * candidates.length)];
    }

    getCell(x, y) {
        return this.map[y][x];
    }

    async doPreTickActions() {}
    async doPostTickActions() {}

    addPlayer(player) {
        let pos = this.getSpawnPoint();
        if (!pos) {
            return false;
        }
        this.players[player.id] = pos;
        this.getCell(x, y).mob = player;
        return true;
    }
}