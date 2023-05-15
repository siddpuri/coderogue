import Util from '../shared/util.js';
import Level from '../game/level.js';

const minBlockSize = 2;
const maxBlockSize = 10;
const minBlockCol = 20;
const maxBlockCol = 60;
const blockJiggleChance = 0.1;

export default class BlockLevel extends Level {
    constructor(server) {
        super(server);
        this.blocks = [];
        for (let row of [5, 15, 25, 35]) {
            for (let col of [25, 40, 55]) {
                this.blocks.push(new Block(this, [col, row]));
            }
        }
    }

    get name() { return 'Rolling Hills'; }
    get spawnTargetPos() { return super.exitPos; }
    get exitPos() { return super.spawnTargetPos; }

    score(player) { player.score += 200; }

    bump(player) {
        super.bump(player);
        if (player.score > 0) player.score--;
    }

    async doLevelAction() {
        for (let block of this.blocks) {
            block.jiggle();
        }
    }
}

class Block {
    constructor(level, pos) {
        this.level = level;
        this.pos = pos;
        this.size = [minBlockSize, minBlockSize];
        this.draw();
    }

    jiggle() {
        if (Math.random() > blockJiggleChance) return;
        this.erase();
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
        candidates = candidates.filter(c => this.isValid(c));
        if (candidates.length == 0) return;
        [this.pos, this.size] = Util.randomElement(candidates);
        this.draw();
    }

    isValid([pos, size]) {
        if (
            size[0] < minBlockSize || size[1] < minBlockSize ||
            size[0] > maxBlockSize || size[1] > maxBlockSize ||
            pos[0] < minBlockCol || pos[1] < 0 ||
            pos[0] + size[0] > maxBlockCol || pos[1] + size[1] > this.level.height
        ) return false;
        for (let c = 0; c < size[0]; c++) {
            for (let r = 0; r < size[1]; r++) {
                let cell = this.level.cell([pos[0] + c, pos[1] + r]);
                if (!cell.canEnter) return false;
            }
        }
        return true;
    }

    draw() {
        for (let c = 0; c < this.size[0]; c++) {
            for (let r = 0; r < this.size[1]; r++) {
                this.level.cell([this.pos[0] + c, this.pos[1] + r]).setWall();
            }
        }
    }

    erase() {
        for (let c = 0; c < this.size[0]; c++) {
            for (let r = 0; r < this.size[1]; r++) {
                this.level.cell([this.pos[0] + c, this.pos[1] + r]).clearWall();
            }
        }
    }
}
