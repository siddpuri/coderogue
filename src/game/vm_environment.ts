import Util from '../shared/util.js';

import Game from './game.js';
import Player from './player.js';

type Pos = [number, number];

const levelWidth = 80;
const levelHeight = 40;

export default class VmEnvironment {
    readonly sandbox: {};

    constructor(
        readonly game: Game,
        readonly player: Player
    ) {
        this.sandbox = {
            // General functionality
            console: { log: this.log.bind(this) },
            state: 'initial',

            // Robot movement
            _moveForward: this.moveForward.bind(this),
            turnRight:    this.turnRight.bind(this),
            turnLeft:     this.turnLeft.bind(this),
            canMove:      this.canMove.bind(this),
            respawn:      this.respawn.bind(this),
            _respawnAt:   this.respawnAt.bind(this),

            forward:  0,
            right:    1,
            backward: 2,
            left:     3,

            // Robot sensors
            // TODO: update for level numbering
            getLevel:         () => this.player.levelNumber - 1,
            getPosition:      () => this.player.pos.slice(),
            getDirection:     () => this.player.dir,
            getStartPosition: () => this.level.spawnTargetPos.slice(),
            getExitPosition:  () => this.level.exitPos.slice(),

            getMap:           this.getMap.bind(this),
            isProtected:      this.isProtected.bind(this),
            isWorthPoints:    this.isWorthPoints.bind(this),
        };
    }

    get level() { return this.game.levels[this.player.levelNumber]; }

    log(...args: any[]) {
        let text = args.map(e => Util.stringify(e)).join(' ');
        this.player.log.write(text);
    }

    moveForward() {
        if (!this.player.useTurn()) return;
        this.level.moveForward(this.player);
    }

    turnRight() {
        if (!this.player.useTurn()) return;
        this.level.turnRight(this.player);
    }

    turnLeft() {
        if (!this.player.useTurn()) return;
        this.level.turnLeft(this.player);
    }

    canMove(dir: number) {
        let checker = new ArgumentChecker(this.player, 'canMove');
        if (!checker.checkDir(dir)) return false;
        return this.level.canMove(this.player, dir);
    }

    respawn() {
        if (!this.player.useTurn()) return;
        this.game.respawn(this.player);
    }

    respawnAt(levelNumber: number, pos: Pos, dir: number) {
        if (!this.player.useTurn()) return;
        let checker = new ArgumentChecker(this.player, 'respawnAt');
        checker.setParameter('level', levelNumber);
        // TODO: update for level numbering
        let level = this.game.levels[levelNumber + 1];
        if (!checker.check(!!level)) return;
        if (!checker.checkPos(pos)) return;
        if (!checker.checkDir(dir)) return;
        this.game.respawnAt(this.player, level, pos, dir);
    }

    getMap() {
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

    getDirChar(dir: number) {
        return ['^', '>', 'v', '<'][dir];
    }

    isProtected(pos: Pos) {
        let checker = new ArgumentChecker(this.player, 'isProtected');
        if (!checker.checkPos(pos)) return false;
        return this.level.isProtected(this.player, pos);
    }

    isWorthPoints(pos: Pos) {
        let checker = new ArgumentChecker(this.player, 'isWorthPoints');
        if (!checker.checkPos(pos)) return false;
        return this.level.isWorthPoints(this.player, pos);
    }
}

class ArgumentChecker {
    player: Player;
    functionName: string;
    parameterName?: string;
    parameterValue?: any;

    constructor(player: Player, functionName: string) {
        this.player = player;
        this.functionName = functionName;
    }

    setParameter(name: string, value: any) {
        this.parameterName = name;
        this.parameterValue = value;
    }

    check(condition: boolean) {
        if (!condition) {
            this.player.log.write(`Invalid argument ${this.parameterName} = ${this.parameterValue} to ${this.functionName}`);
        }
        return condition;
    }

    checkDir(dir: number) {
        this.setParameter('dir', dir);
        if (!this.check(Number.isInteger(dir))) return false;
        if (!this.check(dir >= 0 && dir < 4)) return false;
        return true;
    }

    checkPos(pos: Pos) {
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
