export default class VmEnvironment {
    constructor(game, player) {
        this.game = game;
        this.player = player;
        this.sandbox = {
            // Overridden ES6 functionality
            console: {
                log: text => this.log(text),
                debug: text => console.debug(text),
            },

            // General AppLab functions
            randomNumber: (a, b) => Math.floor(Math.random() * (b - a + 1)) + a,
            appendItem: (l, x) => l.push(x),
            insertItem: (l, i, x) => l.splice(i, 0, x),
            removeItem: (l, i) => l.splice(i, 1),

            // Robot movement
            moveForward: () => this.moveForward(),
            turnRight: () => this.turnRight(),
            turnLeft: () => this.turnLeft(),
            canMove: dir => this.canMove(dir),

            forward: '0',
            right: '1',
            backward: '2',
            left: '3',
        };
    }

    log(text) {
        this.player.log.write(text);
    }

    moveForward() {
        if (!this.player.useTurn()) return false;
        const level = this.player.level;
        return this.game.levels[level].moveForward(this.player);
    }

    turnRight() {
        if (!this.player.useTurn()) return false;
        const level = this.player.level;
        return this.game.levels[level].turnRight(this.player);
    }

    turnLeft() {
        if (!this.player.useTurn()) return false;
        const level = this.player.level;
        return this.game.levels[level].turnLeft(this.player);
    }

    canMove(dir) {
        const level = this.player.level;
        return this.game.levels[level].canMove(this.player, dir);
    }
}
