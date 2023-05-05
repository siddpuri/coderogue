export default class VmEnvironment {
    constructor(game, player) {
        this.game = game;
        this.player = player;
        this.sandbox = {
            // General AppLab functions
            randomNumber: (a, b) => Math.floor(Math.random() * (b - a + 1)) + a,
            appendItem: (l, x) => l.push(x),
            insertItem: (l, i, x) => l.splice(i, 0, x),
            removeItem: (l, i) => l.splice(i, 1),

            // Robot movement
            moveForward: this.moveForward,
            turnRight: this.turnRight,
            turnLeft: this.turnLeft,
            canMove: this.canMove,
            left: 'left',
            right: 'right',
            forward: 'forward',
            backward: 'backward',
        };
    }

    moveForward() {}
    turnRight() {}
    turnLeft() {}
    canMove() { return true; }
}
