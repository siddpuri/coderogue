import Server from '../server/server.js';

import Level from '../game/level.js';

import JigglyBlock from './jiggly_block.js';

type Pos = [number, number];
type Size = [number, number];

export default class BlockLevel extends Level {
    private readonly hills: Hill[] = [];

    constructor(server: Server, levelNumber: number) {
        super(server, levelNumber);
        for (let row of [5, 15, 25, 35]) {
            for (let col of [25, 40, 55]) {
                let hill = new Hill(this, [col, row]);
                this.hills.push(hill);
                hill.drawWalls();
            }
        }
    }

    get name() { return 'Shifting Sand Land'; }
    get spawnTargetPos() { return super.exitPos; }
    get exitPos() { return super.spawnTargetPos; }
    get exitScore() { return 200; }
    get bumpScore() { return -1; }

    doLevelAction(): void {
        for (let hill of this.hills) {
            hill.eraseWalls();
            hill.jiggle();
            hill.drawWalls();
        }
    }
}

class Hill extends JigglyBlock<BlockLevel> {
    constructor(level: BlockLevel, pos: Pos) {
        super(level, pos);
    }

    isValidMove(pos0: Pos, size0: Size, pos1: Pos, size1: Size): boolean {
        let map = this.level.map;
        let valid = true;
        this.forEach(pos1, size1, (p: Pos) => valid &&= map.canEnter(p));
        return valid;
    }
}
