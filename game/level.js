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

    isProtected(currentPlayer, pos) { return true; }
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

    spawn(player) {
        let dir = Util.randomElement([0, 1, 2, 3]);
        this.spawnAround(player, this.spawnTargetPos, dir, 10);
    }

    spawnAt(player, pos, dir) {
        this.spawnAround(player, pos, dir, 0);
    }

    spawnAround(player, pos, dir, radius) {
        for (let r = radius; true; r++) {
            let [dx, dy] = [r, r];
            while (dx * dx + dy * dy > r * r) {
                dx = Util.randomInt(-r, r);
                dy = Util.randomInt(-r, r);
            }
            let candidate = [pos[0] + dx, pos[1] + dy];
            let [x, y] = candidate;
            if (x < 0 || y < 0 || x >= this.width || y >= this.height) continue;
            if (this.cell(candidate).canSpawn) {
                this.addPlayer(player, candidate, dir);
                return;
            }
        }
    }

    addPlayer(player, pos, dir) {
        player.level = this;
        player.pos = pos;
        player.dir = dir;
        this.cell(pos).setPlayer(player);
    }

    removePlayer(player) {
        this.cell(player.pos).clearPlayer();
        player.level = null;
        player.pos = null;
    }

    moveForward(player) {
        let dest = this.movePos(player.pos, player.dir)
        if (this.cell(dest).canEnter) {
            this.movePlayer(player, dest);
        }
        else if (this.cell(dest).hasPlayer) {
            this.bumpPlayer(player, dest);
        }
        else {
            player.log.write(`Bump!`);
            if (player.score > 0) player.addScore(this.bumpScore);
        }
    }

    movePlayer(player, dest) {
        this.cell(player.pos).clearPlayer();
        player.pos = dest;
        this.cell(player.pos).setPlayer(player);
        if (this.cell(player.pos).isExit) {
            player.log.write(`Completed level ${this.levelNumber}!`);
            if (!player.dontScore) {
                player.addScore(this.exitScore);
            }
            this.server.game.exitPlayer(player);
        }
        player.idle = 0;
    }

    bumpPlayer(player, dest) {
        let other = this.server.game.players[this.cell(dest).playerId];
        if (player.dontScore) {
            player.log.write(`Can't bump players after respawnAt.`);
        }
        else if (this.isProtected(player, dest)) {
            player.log.write(`Player ${other.textHandle} is protected.`);
        }
        else {
            if (!other.dontScore) {
                player.addScore(this.killScore);
                player.incrementKills();
                other.incrementDeaths();
            }
            this.server.game.respawn(other);
            player.log.write(`You just bumped off ${other.textHandle}!`);
            other.log.write(`You were bumped off by ${player.textHandle}!`);
            player.idle = 0;
        }
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
