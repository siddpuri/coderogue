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
    }
    
    async doPreTickActions() {}
    async doPostTickActions() {}

    bump(player) {
        player.log.write('Bump!');
    }

    score(player) {}

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

    spawn(player) {
        const pos = this.getSpawnPos();
        if (!pos) {
            console.log('Couldn\t place player!');
            this.removePlayer(player);
            return false;
        }
        this.movePlayer(player, pos);
        player.dir = Util.randomElement([0, 1, 2, 3]);
        return true;
    }

    moveForward(player) {
        console.debug("Moving " + player.id);
        console.debug("from: " + player.pos);
        const newPos = this.movePos(player.pos, player.dir);
        console.debug("to: " + newPos);
        if (!this.cell(newPos).canEnter) {
            this.bump(player);
            return false;
        }
        this.movePlayer(player, newPos);
        if (this.cell(newPos).isExit) {
            this.score(player);
            this.spawn(player);
        }
        return true;
    }

    movePlayer(player, pos) {
        if (player.pos) {
            this.cell(player.pos).clearPlayer();
        }
        player.pos = pos;
        this.cell(pos).setPlayer(player);
    }

    removePlayer(player) {
        this.movePlayer(player, undefined);
    }

    turnRight(player) {
        player.dir = (player.dir + 1) % 4;
    }

    turnLeft(player) {
        player.dir = (player.dir + 3) % 4;
    }

    canMove(player, dir) {
        const realDir = (player.dir + dir) % 4;
        const newPos = movePos(player.pos, realDir);
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
