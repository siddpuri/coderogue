import Util from '../../shared/util.js';

import Level from '../game/level.js';

type Pos = [number, number];
type Size = [number, number];

export default abstract class JigglyBlock<T extends Level> {
    size: Size = [this.minSize, this.minSize];

    constructor(
        protected readonly level: T,
        public pos: Pos
    ) {}

    protected get minSize() { return 2; }
    protected get maxSize() { return 10; }
    protected get minCol() { return 20; }
    protected get maxCol() { return 60; }
    protected get jiggleChance() { return 0.1; }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    protected isValidMove(pos0: Pos, size0: Size, pos1: Pos, size1: Size): boolean {
        return true;
    }

    jiggle(): void {
        if (Math.random() > this.jiggleChance) return;
        let pos = this.pos;
        let size = this.size;
        let candidates: [Pos, Size][] = [
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

    private isValid(pos: Pos, size: Size): boolean {
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

    protected forEach(pos: Pos, size: Size, f: (p: Pos) => void): void {
        let p: Pos = [0, 0];
        for (let x = 0; x < size[0]; x++) {
            p[0] = pos[0] + x;
            for (let y = 0; y < size[1]; y++) {
                p[1] = pos[1] + y;
                f(p);
            }
        }
    }

    drawWalls(): void {
        this.forEach(this.pos, this.size, p => this.level.map.setWall(p));
    }

    eraseWalls(): void {
        this.forEach(this.pos, this.size, p => this.level.map.clearWall(p));
    }
}
