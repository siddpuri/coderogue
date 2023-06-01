import Util from '../shared/util.js';
import Level from '../game/level.js';

import JigglyBlock from './jiggly_block.js';

export default class CaveLevel extends Level {
    constructor(server) {
        super(server);
        this.createCaveSystem();
        this.redraw();
    }

    get name() { return 'Moria'; }
    get spawnTargetPos() { return [8, 8]; }
    get exitPos() { return [this.width - 8, this.height - 8]; }
    get exitScore() { return 500; }
    get bumpScore() { return -1; }
    get maxIdleTime() { return 5; }

    isProtected(currentPlayer, pos) {
        return (
            super.isProtected(currentPlayer, pos) ||
            pos[0] < 14 && pos[1] < 14 ||
            pos[0] > this.width - 14 && pos[1] > this.height - 14
        );
    }

    doLevelAction() {
        for (let cave of this.caves) {
            cave.jiggle();
        }
        for (let tunnel of this.tunnels) {
            tunnel.jiggle();
        }
        this.redraw();
    }

    createCaveSystem() {
        let leftAnchor = new Cave(this, [1, 20], true);
        this.caves = [leftAnchor];
        this.tunnels = [];
        for (let row of [5, 15, 25, 35]) {
            for (let col of [25, 40, 55]) {
                this.connectCave(new Cave(this, [col, row]));
            }
        }
        let rightAnchor = new Cave(this, [67, 20], true);
        this.connectCave(rightAnchor);
    }

    connectCave(cave) {
        let other = Util.randomElement(this.caves);
        this.caves.push(cave);
        this.tunnels.push(new Tunnel(this, other, cave));
    }

    redraw() {
        for (let c = 15; c <= 65; c++) {
            for (let r = 0; r < this.height; r++) {
                this.cell([c, r]).setWall();
            }
        }
        for (let cave of this.caves) {
            cave.eraseWalls();
        }
        for (let tunnel of this.tunnels) {
            tunnel.eraseWalls();
        }
    }
}

class Cave extends JigglyBlock {
    constructor(level, pos, fixedCol = false) {
        super(level, pos);
        this.fixedCol = fixedCol;
    }

    get minSize() { return 4; }
    get maxSize() { return 12; }

    isValidMove(pos0, size0, pos1, size1) {
        let players0 = this.includedPlayers(pos0, size0);
        let players1 = this.includedPlayers(pos1, size1);
        return (
            !(this.fixedCol && pos1[0] != pos0[0]) &&
            !this.level.tunnels.some(t => t.willDisconnect(this, pos1, size1)) &&
            !players0.some(p => !players1.includes(p))
        );
    }

    includedPlayers(pos, size) {
        let result = [];
        this.applyCells(pos, size, c => c.hasPlayer && result.push(c.playerId));
        return result;
    }
}

class Tunnel {
    constructor(level, cave1, cave2) {
        this.level = level;
        if (Math.random() > 0.5) cave1, cave2 = cave2, cave1;
        this.startCave = cave1;
        this.endCave = cave2;
        let x = cave1.pos[0] + Util.randomInt(0, cave1.size[0]);
        let y = cave2.pos[1] + Util.randomInt(0, cave2.size[1]);
        this.corner = [x, y];
    }

    get jiggleChance() { return 0.1; }

    jiggle() {
        if (Math.random() > this.jiggleChance) return;
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

    eraseWalls() {
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
