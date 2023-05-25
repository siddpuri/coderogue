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
    
    get name() { return 'Mystery Level'; }
    get spawnTargetPos() { return [10, 10]; }
    get exitPos() { return [this.width - 10, this.height - 10]; }
    get exitScore() { return 100; }
    get killScore() { return 200; }
    get bumpScore() { return 0; }
    get maxIdleTime() { return 60; }

    isProtected(pos) { return true; }
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
        let dir = Util.randomElement([0, 1, 2, 3]);
        let pos = this.getSpawnPos(this.spawnTargetPos);
        this.spawnAt(player, pos, dir);
    }

    spawnAt(player, pos, dir) {
        if (!this.cell(pos).canSpawn) {
            pos = this.getSpawnPos(pos);
        }
        player.level = this;
        player.pos = pos;
        player.dir = dir;
        this.cell(pos).setPlayer(player);
    }

    moveForward(player) {
        let dest = this.movePos(player.pos, player.dir)
        let cell0 = this.cell(player.pos);
        let cell1 = this.cell(dest);
        if (cell1.canEnter) {
            player.pos = dest;
            cell0.clearPlayer();
            cell1.setPlayer(player);
            if (cell1.isExit) {
                player.log.write(`Completed level ${this.levelNumber}!`);
                if (!player.dontScore) {
                    player.score += this.exitScore;
                }
                this.server.game.exitPlayer(player);
            }
            player.idle = 0;
        }
        else if (cell1.hasPlayer) {
            let other = this.server.game.players[cell1.playerId];
            if (player.dontScore) {
                player.log.write(`Can't bump players after respawnAt.`);
            }
            else if (this.isProtected(dest)) {
                player.log.write(`Player ${other.textHandle} is protected.`);
            }
            else {
                if (!other.dontScore) {
                    player.score += this.killScore;
                    player.kills++;
                    other.deaths++;
                }
                this.server.game.respawn(other);
                player.log.write(`You just bumped off ${other.textHandle}!`);
                other.log.write(`You were bumped off by ${player.textHandle}!`);
                player.idle = 0;
            }
        }
        else {
            player.log.write(`Bump!`);
            if (player.score > 0) player.score += this.bumpScore;
        }
    }

    removePlayer(player) {
        if (player.level != this) console.log('Error in removePlayer');
        this.cell(player.pos).clearPlayer();
        player.level = undefined;
        player.pos = undefined;
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
        return {
            name: this.name,
            map: this.map,
        };
    }
}
