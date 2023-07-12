import Util from '../shared/util.js';

import Game from './game.js';
import Player from './player.js';

type Pos = [number, number];

const levelWidth = 80;
const levelHeight = 40;

export default class VmEnvironment {
    readonly sandbox: object;

    constructor(
        readonly game: Game,
        readonly player: Player
    ) {
        this.sandbox = {
            // General functionality
            _log:           this.log.bind(this),
            state:         'initial',

            // Robot movement
            _moveForward:  this.moveForward.bind(this),
            turnRight:     this.turnRight.bind(this),
            turnLeft:      this.turnLeft.bind(this),
            respawn:       this.respawn.bind(this),
            _respawnAt:    this.respawnAt.bind(this),

            // Robot sensors
            _getGameState: this.getGameState.bind(this),
            getMap:        this.getMap.bind(this),
            isProtected:   this.isProtected.bind(this),
            isWorthPoints: this.isWorthPoints.bind(this),
        };
    }

    private get level() { return this.game.levels[this.player.levelNumber]; }

    private log(entries: string[]): void {
        for (let entry of entries) this.player.log.write(entry);
    }

    private moveForward(): void {
        if (!this.player.useTurn()) return;
        this.level.moveForward(this.player);
    }

    private turnRight(): void {
        if (!this.player.useTurn()) return;
        this.level.turnRight(this.player);
    }

    private turnLeft(): void {
        if (!this.player.useTurn()) return;
        this.level.turnLeft(this.player);
    }

    private respawn(): void {
        if (!this.player.useTurn()) return;
        this.game.respawn(this.player);
    }

    private respawnAt(levelNumber: number, pos: Pos, dir: number): void {
        if (!this.player.useTurn()) return;
        let checker = new ArgumentChecker(this, 'respawnAt');
        if (!checker.checkLevel(levelNumber)) return;
        if (!checker.checkPos(pos)) return;
        if (!checker.checkDir(dir)) return;
        let level = this.game.levels[levelNumber + 1];
        this.game.respawnAt(this.player, level, pos, dir);
    }

    private getGameState(): (boolean | number)[] {
        return [
            this.level.canMove(this.player, 0),
            this.level.canMove(this.player, 1),
            this.level.canMove(this.player, 2),
            this.level.canMove(this.player, 3),
            // TODO: update for level numbering
            this.player.levelNumber - 1,
            this.player.pos[0],
            this.player.pos[1],
            this.player.dir,
            this.level.spawnTargetPos[0],
            this.level.spawnTargetPos[1],
            this.level.exitPos[0],
            this.level.exitPos[1],
        ];
    }


    private getMap(): Uint8Array {
        let result = new Uint8Array(80 * 40);
        let map = this.level.map;
        let pos: Pos = [0, 0];
        for (let y = 0; y < 40; y++) {
            pos[1] = y;
            for (let x = 0; x < 80; x++) {
                pos[0] = x;
                let char = ' ';
                if (map.hasWall(pos)) char = '#';
                if (map.hasExit(pos)) char = 'o';
                if (map.hasSpawn(pos)) char = '.';
                let playerId = map.getPlayerId(pos);
                if (playerId != null) char = this.getDirChar(this.game.players[playerId].dir);
                let mobId = map.getMobId(pos);
                if (mobId != null) char = this.getDirChar(this.level.mobs[mobId].dir);
                result[y * 80 + x] = char.charCodeAt(0);
            }
        }
        return result;
    }

    private getDirChar(dir: number): string {
        return ['^', '>', 'v', '<'][dir];
    }

    private isProtected(pos: Pos): boolean {
        let checker = new ArgumentChecker(this, 'isProtected');
        if (!checker.checkPos(pos)) return false;
        return this.level.isProtected(this.player, pos);
    }

    private isWorthPoints(pos: Pos): number {
        let checker = new ArgumentChecker(this, 'isWorthPoints');
        if (!checker.checkPos(pos)) return 0;
        return this.level.isWorthPoints(this.player, pos);
    }
}

class ArgumentChecker {
    param!: string;
    value!: string;

    constructor(
        private readonly env: VmEnvironment,
        private readonly functionName: string
    ) {}

    setParameter(name: string, value: string): void {
        this.param = name;
        this.value = value;
    }

    check(condition: boolean): boolean {
        if (!condition) {
            let message = `Invalid argument for ${this.functionName}(): ${this.param} = ${this.value}`;
            this.env.player.log.write(message);
        }
        return condition;
    }

    checkLevel(levelNumber: number): boolean {
        this.setParameter('levelNumber', levelNumber.toString());
        if (!this.check(Number.isInteger(levelNumber))) return false;
        // TODO: update for level numbering
        if (!this.check(levelNumber >= 0 && levelNumber < this.env.game.levels.length - 1)) return false;
        return true;
    }

    checkDir(dir: number): boolean {
        this.setParameter('dir', dir.toString());
        if (!this.check(Number.isInteger(dir))) return false;
        if (!this.check(dir >= 0 && dir < 4)) return false;
        return true;
    }

    checkPos(pos: Pos): boolean {
        this.setParameter('pos', Util.stringify(pos));
        if (!this.check(Array.isArray(pos))) return false;
        if (!this.check(pos.length == 2)) return false;
        if (!this.check(Number.isInteger(pos[0]))) return false;
        if (!this.check(Number.isInteger(pos[1]))) return false;
        if (!this.check(pos[0] >= 0 && pos[0] < levelWidth)) return false;
        if (!this.check(pos[1] >= 0 && pos[1] < levelHeight)) return false;
        return true;
    }
}
