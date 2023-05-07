export default class VmEnvironment {
    constructor(game, playerId) {
        this.game = game;
        this.playerId = playerId;
        this.sandbox = {
            // Overridden ES6 functionality
            console: { log: text => game.log(this.playerId, text) },

            // General AppLab functions
            randomNumber: (a, b) => Math.floor(Math.random() * (b - a + 1)) + a,
            appendItem: (l, x) => l.push(x),
            insertItem: (l, i, x) => l.splice(i, 0, x),
            removeItem: (l, i) => l.splice(i, 1),

            // Robot movement
            moveForward: () => this.game.moveForward(this.playerId),
            turnRight: () => this.game.turnRight(this.playerId),
            turnLeft: () => this.game.turnLeft(this.playerId),
            canMove: dir => this.game.canMove(this.playerId, dir),

            forward: '0',
            right: '1',
            backward: '2',
            left: '3',
        };
    }
}
