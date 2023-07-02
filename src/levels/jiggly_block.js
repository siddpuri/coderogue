import Util from '#ts/shared/util.js';

export default class JigglyBlock {
    constructor(level, pos) {
        this.level = level;
        this.pos = pos;
        this.size = [this.minSize, this.minSize];
    }

    get minSize() { return 2; }
    get maxSize() { return 10; }
    get minCol() { return 20; }
    get maxCol() { return 60; }
    get jiggleChance() { return 0.1; }

    isValidMove(pos0, size0, pos1, size1) { return true; }

    jiggle() {
        if (Math.random() > this.jiggleChance) return;
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
        candidates = candidates
            .filter(c => this.isValid(c[0], c[1]))
            .filter(c => this.isValidMove(pos, size, c[0], c[1]));
        if (candidates.length == 0) return;
        [this.pos, this.size] = Util.randomElement(candidates);
    }

    isValid(pos, size) {
        return (
            size[0] >= this.minSize &&
            size[0] <= this.maxSize &&
            size[1] >= this.minSize &&
            size[1] <= this.maxSize &&
            pos[0] >= this.minCol &&
            pos[0] + size[0] < this.maxCol &&
            pos[1] > 0 &&
            pos[1] + size[1] < this.level.height
        );
    }

    forEach(pos, size, f) {
        let p = [0, 0];
        for (let x = 0; x < size[0]; x++) {
            p[0] = pos[0] + x;
            for (let y = 0; y < size[1]; y++) {
                p[1] = pos[1] + y;
                f(p);
            }
        }
    }

    drawWalls() {
        this.forEach(this.pos, this.size, p => this.level.map.setWall(p));
    }

    eraseWalls() {
        this.forEach(this.pos, this.size, p => this.level.map.clearWall(p));
    }
}
