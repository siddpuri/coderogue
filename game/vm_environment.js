export default class VmEnvironment {
    constructor(game, player) {
        this.game = game;
        this.player = player;
        this.sandbox = {
            // General functionality
            console: {
                log: text => this.log(text),
                debug: text => console.debug(text),
            },

            state: 'initial',

            // Robot movement
            moveForward: () => this.moveForward(),
            turnRight: () => this.turnRight(),
            turnLeft: () => this.turnLeft(),
            canMove: dir => this.canMove(dir),
            respawn: () => this.game.killPlayer(this.player),
            respawnAt: (level, pos, dir) => this.game.respawnAt(this.player, level, pos, dir),

            forward: 0,
            right: 1,
            backward: 2,
            left: 3,

            // Robot sensors
            getLevel: () => this.player.level.levelNumber,
            getPosition: () => this.player.pos,
            getDirection: () => this.player.dir,
            getExitPosition: () => this.player.level.exitPos,

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
        if (!this.player.useTurn()) return false;
        return this.player.level.moveForward(this.player);
    }

    turnRight() {
        if (!this.player.useTurn()) return false;
        return this.player.level.turnRight(this.player);
    }

    turnLeft() {
        if (!this.player.useTurn()) return false;
        return this.player.level.turnLeft(this.player);
    }

    canMove(dir) {
        return this.player.level.canMove(this.player, dir);
    }
}
