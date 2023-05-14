export default class VmEnvironment {
    constructor(game, player) {
        this.game = game;
        this.player = player;
        this.sandbox = {
            // General functionality
            console: {
                log: obj => this.log(obj.toString()),
                debug: obj => console.debug(obj),
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
            getExitPosition: () => this.player.level.exitPos.slice(),

            // AppLab functions
            randomNumber: (a, b) => Math.floor(Math.random() * (b - a + 1)) + a,
            appendItem: (l, x) => l.push(x),
            insertItem: (l, i, x) => l.splice(i, 0, x),
            removeItem: (l, i) => l.splice(i, 1),
        };
    }

    log(text) {
        this.player.log.write(text);
    }

    moveForward() {
        if (this.player.useTurn()) {
            this.player.level.moveForward(this.player);
        }
    }

    turnRight() {
        if (this.player.useTurn()) {
            this.player.level.turnRight(this.player);
        }
    }

    turnLeft() {
        if (this.player.useTurn()) {
            return this.player.level.turnLeft(this.player);
        }
    }

    canMove(dir) {
        if (!Number.isInteger(dir) || dir < 0 || dir > 3) return false;
        return this.player.level.canMove(this.player, dir);
    }

    respawn() {
        if (this.player.useTurn()) {
            this.game.respawn(this.player);
        }
    }

    respawnAt(level, pos, dir) {
        if (!this.player.useTurn()) return false;
        if (!this.game.levels[level]) return false;
        if (!Array.isArray(pos) || pos.length != 2) return false;
        if (!Number.isInteger(dir) || dir < 0 || dir > 3) return false;
        this.game.respawnAt(this.player, level, pos, dir);
    }
}
