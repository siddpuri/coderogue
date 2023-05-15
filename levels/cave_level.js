import Util from '../shared/util.js';
import Level from '../game/level.js';

const minCaveSize = 4;
const maxCaveSize = 12;
const minCaveCol = 20;
const maxCaveCol = 60;
const jiggleChance = 0.1;

export default class CaveLevel extends Level {
    constructor(server) {
        super(server);
        this.createCaveSystem();
        this.redraw();
    }

    get name() { return 'Moria'; }
    get spawnTargetPos() { return [8, 8]; }
    get exitPos() { return [this.width - 8, this.height - 8]; }

    score(player) {
        player.score += 300;
        super.score(player);
    }

    bump(player) {
        let cell = this.cell(this.movePos(player.pos, player.dir));
        if (cell.hasPlayer && !player.dontScore) {
            let other = this.server.game.players[cell.playerId];
            this.server.game.respawn(other);
            player.log.write(`You just bumped off ${other.textHandle}!`);
            other.log.write(`You were bumped off by ${player.textHandle}!`);
            this.score(player);
        } else {
            super.bump(player);
            if (player.score > 0) player.score--;
        }
    }

    async doLevelAction() {
        for (let cave of this.caves) {
            cave.jiggle();
        }
        for (let tunnel of this.tunnels) {
            tunnel.jiggle();
        }
        this.redraw();
    }

    createCaveSystem() {
        this.caves = [new Cave(this, [1, 20], true)];
        this.tunnels = [];
        for (let row of [5, 15, 25, 35]) {
            for (let col of [25, 40, 55]) {
                this.connectCave(new Cave(this, [col, row]));
            }
        }
        this.connectCave(new Cave(this, [67, 20], true));
    }

    connectCave(cave) {
        let other = Util.randomElement(this.caves);
        this.caves.push(cave);
        this.tunnels.push(new Tunnel(this, other, cave));
    }

    redraw() {
        for (let c = minCaveCol - 5; c <= maxCaveCol + 5; c++) {
            for (let r = 0; r < this.height; r++) {
                this.cell([c, r]).setWall();
            }
        }
        for (let cave of this.caves) {
            cave.draw();
        }
        for (let tunnel of this.tunnels) {
            tunnel.draw();
        }
        this.cell(this.spawnTargetPos).setSpawn();
        this.cell(this.exitPos).setExit();
    }
}

class Cave {
    constructor(level, pos, fixedCol = false) {
        this.level = level;
        this.pos = pos;
        this.fixedCol = fixedCol;
        this.size = [minCaveSize, minCaveSize];
    }

    jiggle() {
        if (Math.random() > jiggleChance) return;
        let pos = this.pos;
        let size = this.size;
        let candidates = [
            [[pos[0] - 1, pos[1]], size],
            [[pos[0] + 1, pos[1]], size],
            [[pos[0], pos[1] - 1], size],
            [[pos[0], pos[1] + 1], size],
            [pos, [size[0] - 1, size[1]]],
            [pos, [size[0] + 1, size[1]]],
            [pos, [size[0], size[1] - 1]],
            [pos, [size[0], size[1] + 1]],
            [[pos[0] - 1, pos[1]], [size[0] + 1, size[1]]],
            [[pos[0] + 1, pos[1]], [size[0] - 1, size[1]]],
            [[pos[0], pos[1] - 1], [size[0], size[1] + 1]],
            [[pos[0], pos[1] + 1], [size[0], size[1] - 1]],
        ];
        let p = this.includedPlayers(pos, size);
        candidates = candidates.filter(c => this.isValid(c, p));
        if (candidates.length == 0) return;
        [this.pos, this.size] = Util.randomElement(candidates);
    }

    isValid([pos, size], originalPlayers) {
        if (this.isFixedCol && pos[0] != this.pos[0]) return false;
        if (
            size[0] < minCaveSize || size[1] < minCaveSize ||
            size[0] > maxCaveSize || size[1] > maxCaveSize ||
            pos[0] < minCaveCol || pos[1] <= 0 ||
            pos[0] + size[0] > maxCaveCol || pos[1] + size[1] >= this.level.height
        ) return false;
        if (this.level.tunnels.some(t => t.willDisconnect(this, pos, size))) return false;
        let players = this.includedPlayers(pos, size);
        if (originalPlayers.some(p => !players.includes(p))) return false;
        return true;
    }

    includedPlayers(pos, size) {
        let result = [];
        for (let c = pos[0]; c < pos[0] + size[0]; c++) {
            for (let r = pos[1]; r < pos[1] + size[1]; r++) {
                let cell = this.level.cell([c, r]);
                if (cell.hasPlayer) result.push(cell.playerId);
            }
        }
        return result;
    }

    draw() {
        let pos = this.pos;
        let size = this.size;
        for (let c = pos[0]; c < pos[0] + size[0]; c++) {
            for (let r = pos[1]; r < pos[1] + size[1]; r++) {
                this.level.cell([c, r]).clearWall();
            }
        }
    }
}

class Tunnel {
    constructor(level, cave1, cave2) {
        this.level = level;
        if (Math.random() > 0.5) cave1, cave2 = cave2, cave1;
        this.startCave = cave1;
        this.endCave = cave2;
        let x = cave1.pos[0] + Math.floor(Math.random() * cave1.size[0]);
        let y = cave2.pos[1] + Math.floor(Math.random() * cave2.size[1]);
        this.corner = [x, y];
    }

    jiggle() {
        if (Math.random() > jiggleChance) return;
        let candidates = [
            [this.corner[0] - 1, this.corner[1]],
            [this.corner[0] + 1, this.corner[1]],
            [this.corner[0], this.corner[1] - 1],
            [this.corner[0], this.corner[1] + 1],
        ];
        let p = this.includedPlayers(this.corner);
        candidates = candidates.filter(c => this.isValid(c, p));
        if (candidates.length == 0) return;
        this.corner = Util.randomElement(candidates);
    }

    isValid(corner, originalPlayers) {
        if (
            this.startCave.pos[0] > corner[0] ||
            this.startCave.pos[0] + this.startCave.size[0] <= corner[0] ||
            this.endCave.pos[1] > corner[1] ||
            this.endCave.pos[1] + this.endCave.size[1] <= corner[1]
        ) return false;
        let players = this.includedPlayers(corner);
        if (originalPlayers.some(p => !players.includes(p))) return false;
        return true;
    }

    includedPlayers(corner) {
        let result = [];
        let x = corner[0];
        let y = this.startCave.pos[1];
        let dy = Math.sign(corner[1] - y);
        for (; y != corner[1]; y += dy) {
            let cell = this.level.cell([x, y]);
            if (cell.hasPlayer) result.push(cell.playerId);
        }
        let dx = Math.sign(this.endCave.pos[0] - x);
        for (; x != this.endCave.pos[0]; x += dx) {
            let cell = this.level.cell([x, y]);
            if (cell.hasPlayer) result.push(cell.playerId);
        }
        return result;
    }

    willDisconnect(cave, pos, size) {
        if (cave == this.startCave) {
            if (pos[0] > this.corner[0]) return true;
            if (pos[0] + size[0] <= this.corner[0]) return true;
        } else if (cave == this.endCave) {
            if (pos[1] > this.corner[1]) return true;
            if (pos[1] + size[1] <= this.corner[1]) return true;
        }
        return false;
    }

    draw() {
        let x = this.corner[0];
        let y = this.startCave.pos[1];
        let dy = Math.sign(this.corner[1] - y);
        for (; y != this.corner[1]; y += dy) {
            this.level.cell([x, y]).clearWall();
        }
        let dx = Math.sign(this.endCave.pos[0] - x);
        for (; x != this.endCave.pos[0]; x += dx) {
            this.level.cell([x, y]).clearWall();
        }
    }
}
