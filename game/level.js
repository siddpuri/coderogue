import constants from '../shared/constants.js';
import Util from '../shared/util.js';

import Cell from './cell.js';

// Translate from direction (0,1,2,3) to a position offset
const offsets = [
    [ 0, -1],
    [ 1,  0],
    [ 0,  1],
    [-1,  0],
];

export default class Level {
    constructor(game) {
        this.game = game;
        this.width = constants.levelWidth;
        this.height = constants.levelHeight;
        this.map =
            Array(this.height).fill().map(() =>
                Array(this.width).fill().map(() => new Cell()));
        this.cell(this.spawnTargetPos).setSpawn();
        this.cell(this.exitPos).setExit();
        this.positions = {};
    }
    
    async doPreTickActions() {}
    async doPostTickActions() {}

    bump(playerId) {
        this.game.log(playerId, 'Bump!');
    }

    get spawnTargetPos() { return [10, 10]; }

    get exitPos() { return [this.width - 10, this.height - 10]; }

    getSpawnPos() {
        const candidates = [];
        let [x0, y0] = this.spawnTargetPos;
        for (let x = x0 - 10; x <= x0 + 10; x++) {
            for (let y = y0 - 10; y <= y0 + 10; y++) {
                const pos = [x,  y];
                if (this.cell(pos).canEnter) {
                    candidates.push(pos);
                }
            }
        }
        if (candidates.length == 0) return null;
        return Util.randomElement(candidates);
    }

    addPlayer(playerId) {
        const pos = this.getSpawnPos();
        if (!pos) return false;
        const dir = Util.randomElement([0, 1, 2, 3]);
        this.cell(pos).setPlayerId(playerId, dir);
        this.positions[playerId] = pos;
        return true;
    }

    moveForward(playerId) {
        const pos = this.positions[playerId];
        const cell = this.cell(pos);
        const dir = cell.dir;
        const newPos = this.movePos(pos, dir);
        const newCell = this.cell(newPos);
        if (newCell.canEnter) {
            cell.clearPlayer();
            newCell.setPlayerId(playerId, dir);
            this.positions[playerId] = newPos;
        } else {
            this.bump(playerId);
        }
    }

    turnRight(playerId) {
        const cell = this.cell(this.positions[playerId]);
        cell.dir = (cell.dir + 1) % 4;
    }

    turnLeft(playerId) {
        const cell = this.cell(this.positions[playerId]);
        cell.dir = (cell.dir + 3) % 4;
    }

    canMove(playerId, dir) {
        const pos = this.positions[playerId];
        const realDir = (this.cell(pos).dir + dir) % 4;
        const newPos = movePos(pos, realDir);
        return this.cell(newPos).canEnter;
    }

    cell(pos) {
        return this.map[pos[1]][pos[0]];
    }

    movePos(pos, dir) {
        const offset = offsets[dir];
        return [pos[0] + offset[0], pos[1] + offset[1]];
    }
}
