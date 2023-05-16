export default class VmEnvironment {
    constructor(game, player) {
        this.game = game;
        this.player = player;
        this.sandbox = {
            // General functionality
            console: {
                log: value => this.log(value),
                debug: value => console.debug(value),
            },

            state: 'initial',

            // Robot movement
            moveForward: () => this.moveForward(),
            turnRight: () => this.turnRight(),
            turnLeft: () => this.turnLeft(),
            canMove: dir => this.canMove(dir),
            respawn: () => this.respawn(),
            respawnAt: (level, pos, dir) => this.respawnAt(level, pos, dir),

            forward: 0,
            right: 1,
            backward: 2,
            left: 3,

            // Robot sensors
            getLevel: () => this.player.level.levelNumber,
            getPosition: () => this.player.pos.slice(),
            getDirection: () => this.player.dir,
            getStartPosition: () => this.player.level.spawnTargetPos.slice(),
            getExitPosition: () => this.player.level.exitPos.slice(),
            whatsAt: pos => this.whatsAt(pos),

            // AppLab functions
            randomNumber: (a, b) => Math.floor(Math.random() * (b - a + 1)) + a,
            appendItem: (l, x) => l.push(x),
            insertItem: (l, i, x) => l.splice(i, 0, x),
            removeItem: (l, i) => l.splice(i, 1),
        };
    }

    log(value) {
        let text = Array.isArray(value)?
            '[' + value.map(e => String(e)).join(', ') + ']':
            String(value);
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
        this.setParameter('pos', pos);
        if (!this.check(Array.isArray(pos))) return false;
        if (!this.check(pos.length == 2)) return false;
        if (!this.check(level.map[pos[1]])) return false;
        if (!this.check(level.cell(pos))) return false;
        return true;
    }
}
