import Util from '../shared/util.js';

import Server from '../server/server.js';

import Level from '../game/level.js';
import Player from '../game/player.js';

import JigglyBlock from './jiggly_block.js';

type Pos = [number, number];
type Size = [number, number];

export default class CaveLevel extends Level {
    readonly caves: Cave[] = [];
    readonly tunnels: Tunnel[] = [];

    constructor(server: Server, levelNumber: number) {
        super(server, levelNumber);
        this.createCaveSystem();
        this.redraw();
    }

    get name() { return 'Moria'; }
    get spawnTargetPos(): Pos { return [8, 8]; }
    get exitPos(): Pos { return [this.width - 8, this.height - 8]; }
    get exitScore() { return 500; }
    get bumpScore() { return -1; }
    get maxIdleTime() { return 5; }

    isProtected(currentPlayer: Player, pos: Pos) {
        return (
            super.hasGrownupProtection(currentPlayer, pos) ||
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

    private createCaveSystem() {
        let leftAnchor = new Cave(this, [1, 20], true);
        this.caves.push(leftAnchor);
        for (let row of [5, 15, 25, 35]) {
            for (let col of [25, 40, 55]) {
                this.connectCave(new Cave(this, [col, row]));
            }
        }
        let rightAnchor = new Cave(this, [67, 20], true);
        this.connectCave(rightAnchor);
    }

    private connectCave(cave: Cave) {
        let other = Util.randomElement(this.caves);
        this.caves.push(cave);
        this.tunnels.push(new Tunnel(this, other, cave));
    }

    private redraw() {
        for (let x = 15; x <= 65; x++) {
            for (let y = 0; y < this.height; y++) {
                this.map.setWall([x, y]);
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

class Cave extends JigglyBlock<CaveLevel> {
    constructor(
        level: CaveLevel,
        pos: Pos,
        private readonly fixedCol = false
    ) {
        super(level, pos);
    }

    get minSize() { return 4; }
    get maxSize() { return 12; }

    isValidMove(pos0: Pos, size0: Size, pos1: Pos, size1: Size) {
        let players0 = this.includedPlayers(pos0, size0);
        let players1 = this.includedPlayers(pos1, size1);
        return (
            !(this.fixedCol && pos1[0] != pos0[0]) &&
            !this.level.tunnels.some(t => t.willDisconnect(this, pos1, size1)) &&
            !players0.some(p => !players1.includes(p))
        );
    }

    private includedPlayers(pos: Pos, size: Size) {
        let map = this.level.map;
        let result: number[] = [];
        this.forEach(pos, size, (p: Pos) => {
            if (map.hasPlayer(p)) result.push(map.getPlayerId(p) as number);
        });
        return result;
    }
}

class Tunnel {
    corner: Pos;

    constructor(
        private readonly level: CaveLevel,
        private readonly startCave: Cave,
        private readonly endCave: Cave
    ) {
        if (Math.random() > 0.5) [startCave, endCave] = [endCave, startCave];
        let x = startCave.pos[0] + Util.randomInt(0, startCave.size[0]);
        let y = endCave.pos[1] + Util.randomInt(0, endCave.size[1]);
        this.corner = [x, y];
    }

    private get jiggleChance() { return 0.1; }

    jiggle() {
        if (Math.random() > this.jiggleChance) return;
        let candidates: Pos[] = [
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

    private isValid(corner: Pos, originalPlayers: number[]) {
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

    private includedPlayers(corner: Pos) {
        let map = this.level.map;
        let result = [];
        let pos: Pos = [corner[0], this.startCave.pos[1]];
        let dy = Math.sign(corner[1] - pos[1]);
        for (; pos[1] != corner[1]; pos[1] += dy) {
            if (map.hasPlayer(pos)) result.push(map.getPlayerId(pos) as number);
        }
        let dx = Math.sign(this.endCave.pos[0] - pos[0]);
        for (; pos[0] != this.endCave.pos[0]; pos[0] += dx) {
            if (map.hasPlayer(pos)) result.push(map.getPlayerId(pos) as number);
        }
        return result;
    }

    willDisconnect(cave: Cave, pos: Pos, size: Size) {
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
            this.level.map.clearWall([x, y]);
        }
        let dx = Math.sign(this.endCave.pos[0] - x);
        for (; x != this.endCave.pos[0]; x += dx) {
            this.level.map.clearWall([x, y]);
        }
    }
}
