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
    constructor(server) {
        this.server = server;
        this.width = constants.levelWidth;
        this.height = constants.levelHeight;
        this.map =
            Array(this.height).fill().map(() =>
                Array(this.width).fill().map(() => new Cell()));
        this.drawBorderWalls();
        this.cell(this.spawnTargetPos).setSpawn();
        this.cell(this.exitPos).setExit();
    }
    
    score(player) {}
    bump(player) { player.log.write('Bump!'); }
    get spawnTargetPos() { return [10, 10]; }
    get exitPos() { return [this.width - 10, this.height - 10]; }
    async doLevelAction() {}

    drawBorderWalls() {
        for (let c = 0; c < this.width; c++) {
            this.map[0][c].setWall();
            this.map[this.height - 1][c].setWall();
        }
        for (let r = 0; r < this.height; r++) {
            this.map[r][0].setWall();
            this.map[r][this.width - 1].setWall();
        }
    }

    getSpawnPos(pos) {
        const candidates = [];
        let [x0, y0] = pos;
        for (let x = x0 - 10; x <= x0 + 10; x++) {
            for (let y = y0 - 10; y <= y0 + 10; y++) {
                if (x < 0 || y < 0 || x >= this.width || y >= this.height) continue;
                const pos = [x,  y];
                if (this.cell(pos).canSpawn) {
                    candidates.push(pos);
                }
            }
        }
        if (candidates.length == 0) {
            return this.getSpawnPos(this.spawnTargetPos);
        }
        return Util.randomElement(candidates);
    }

    spawn(player) {
        if (player.level) console.log('Error in spawn');
        const dir = Util.randomElement([0, 1, 2, 3]);
        return this.spawnAt(player, this.spawnTargetPos, dir);
    }

    spawnAt(player, targetPos, dir) {
        if (player.level) console.log('Error in spawnAt');
        let pos = targetPos;
        if (!this.map[pos[1]] ||
            !this.cell(pos) ||
            !this.cell(pos).canSpawn)
        {
            pos = this.getSpawnPos(targetPos);
        }
        player.level = this;
        this.movePlayer(player, pos);
        player.dir = dir;
        return true;
    }

    moveForward(player) {
        const newPos = this.movePos(player.pos, player.dir);
        if (!this.cell(newPos).canEnter) {
            this.bump(player);
            return false;
        }
        this.movePlayer(player, newPos);
        if (this.cell(newPos).isExit) {
            this.server.game.exitPlayer(player);
        }
        return true;
    }

    movePlayer(player, pos) {
        if (player.pos) {
            this.cell(player.pos).clearPlayer();
        }
        player.pos = pos;
        if (player.pos) {
            this.cell(pos).setPlayer(player);
        }
        player.idle = 0;
    }

    removePlayer(player) {
        if (player.level != this) console.log('Error in removePlayer');
        player.level = undefined;
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
        const newPos = this.movePos(player.pos, realDir);
        return this.cell(newPos).canEnter;
    }

    cell(pos) {
        try {
            return this.map[pos[1]][pos[0]];
        } catch(e) {
            console.log('cell', pos, e);
            return this.map[0][0];
        }
    }

    movePos(pos, dir) {
        const offset = offsets[dir];
        return [pos[0] + offset[0], pos[1] + offset[1]];
    }

    getState() {
        return this.map;
    }
}
