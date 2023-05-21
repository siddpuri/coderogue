import Util from '../shared/util.js';

export default class VmEnvironment {
    constructor(game, player) {
        this.game = game;
        this.player = player;
        this.sandbox = {
            // General functionality
            console: { log: this.log.bind(this) },

            state: 'initial',

            // Robot movement
            moveForward: this.moveForward.bind(this),
            turnRight:   this.turnRight.bind(this),
            turnLeft:    this.turnLeft.bind(this),
            canMove:     this.canMove.bind(this),
            respawn:     this.respawn.bind(this),
            respawnAt:   this.respawnAt.bind(this),

            forward:  0,
            right:    1,
            backward: 2,
            left:     3,

            // Robot sensors
            getLevel:         () => this.player.level.levelNumber,
            getPosition:      () => this.player.pos.slice(),
            getDirection:     () => this.player.dir,
            getStartPosition: () => this.player.level.spawnTargetPos.slice(),
            getExitPosition:  () => this.player.level.exitPos.slice(),
            isProtected:      pos => this.player.level.isProtected(pos),

            // Internal
            getMap:           this.getMap.bind(this),

            // AppLab functions
            randomNumber: (a, b)    => Math.floor(Math.random() * (b - a + 1)) + a,
            appendItem:   (l, x)    => l.push(x),
            insertItem:   (l, i, x) => l.splice(i, 0, x),
            removeItem:   (l, i)    => l.splice(i, 1),
        };
    }

    log(...args) {
        let text = args.map(e => Util.stringify(e)).join(' ');
        this.player.log.write(text);
    }

    moveForward() {
        if (!this.player.useTurn()) return;
        this.player.level.moveForward(this.player);
    }

    turnRight() {
        if (!this.player.useTurn()) return;
        this.player.level.turnRight(this.player);
    }

    turnLeft() {
        if (!this.player.useTurn()) return;
        this.player.level.turnLeft(this.player);
    }

    canMove(dir) {
        let checker = new ArgumentChecker(this.player, 'canMove');
        if (!checker.checkDir(dir)) return false;
        return this.player.level.canMove(this.player, dir);
    }

    respawn() {
        if (!this.player.useTurn()) return;
        this.game.respawn(this.player);
    }

    respawnAt(levelNumber, pos, dir) {
        if (!this.player.useTurn()) return;
        let checker = new ArgumentChecker(this.player, 'respawnAt');
        checker.setParameter('level', levelNumber);
        let level = this.game.levels[levelNumber];
        if (!checker.check(level)) return;
        if (!checker.checkPos(level, pos)) return;
        if (!checker.checkDir(dir)) return;
        this.game.respawnAt(this.player, level, pos, dir);
    }

    whatsAt(pos) {
        let checker = new ArgumentChecker(this.player, 'whatsAt');
        if (!checker.checkPos(this.player.level, pos)) return '#';
        let cell = this.player.level.cell(pos);
        let char = cell.type?? ' ';
        if (Object.hasOwn(cell, 'playerId')) {
            let dir = this.game.players[cell.playerId].dir;
            char = '^>v<'[dir];
        }
        return char;
    }

    getMap() {
        let map = new Uint8Array(80 * 40);
        for (let y = 0; y < 40; y++) {
            for (let x = 0; x < 80; x++) {
                let cell = this.player.level.cell([x, y]);
                let char = cell.type?? ' ';
                if (Object.hasOwn(cell, 'playerId')) {
                    let dir = this.game.players[cell.playerId].dir;
                    char = '^>v<'[dir];
                }
                map[y * 80 + x] = char.charCodeAt(0);
            }
        }
        return map;
    }
}

class ArgumentChecker {
    constructor(player, functionName) {
        this.player = player;
        this.functionName = functionName;
    }

    setParameter(name, value) {
        this.parameterName = name;
        this.parameterValue = value;
    }

    check(condition) {
        if (!condition) {
            this.player.log.write(`Invalid argument ${this.parameterName} = ${this.parameterVallue} to ${this.functionName}`);
        }
        return condition;
    }

    checkDir(dir) {
        this.setParameter('dir', dir);
        if (!this.check(Number.isInteger(dir))) return false;
        if (!this.check(dir >= 0 && dir <= 3)) return false;
        return true;
    }

    checkPos(level, pos) {
        this.setParameter('pos', Util.stringify(pos));
        if (!this.check(Array.isArray(pos))) return false;
        if (!this.check(pos.length == 2)) return false;
        if (!this.check(level.map[pos[1]])) return false;
        if (!this.check(level.cell(pos))) return false;
        return true;
    }
}
