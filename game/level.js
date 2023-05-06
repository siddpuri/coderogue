import constants from '../shared/constants.js';
import Util from '../shared/util.js';

import Cell from './cell.js';

export default class Level {
    constructor() {
        this.width = constants.levelWidth;
        this.height = constants.levelHeight;
        this.map =
            Array(this.height).fill().map(() =>
                Array(this.width).fill().map(() => new Cell()));
        this.cell(this.spawnTargetPos).setSpawn();
        this.cell(this.exitPos).setExit();
        this.players = {};
    }
    
    get spawnTargetPos() { return [10, 10]; }

    get exitPos() { return [this.width - 10, this.height - 10]; }

    getSpawnPos() {
        const candidates = [];
        let [x0, y0] = this.spawnTargetPos;
        for (let x = x0 - 10; x <= x0 + 10; x++) {
            for (let y = y0 - 10; y <= y0 + 10; y++) {
                const pos = [y,  x];
                if (this.cell(pos).isFree) {
                    candidates.push(pos);
                }
            }
        }
        if (candidates.length == 0) return null;
        return Util.randomElement(candidates);
    }

    async doPreTickActions() {}
    async doPostTickActions() {}

    addPlayer(playerId) {
        const pos = this.getSpawnPos();
        if (!pos) return false;
        this.players[playerId] = pos;
        const dir = Util.randomElement(['^', 'v', '<', '>']);
        this.cell(pos).setPlayerId(playerId, dir);
        return true;
    }

    cell(pos) {
        return this.map[pos[1]][pos[0]];
    }
}
