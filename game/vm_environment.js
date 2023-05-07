import GameApi from './game_api.js';

export default class VmEnvironment {
    constructor(game, playerId) {
        this.game = game;
        this.playerId = playerId;
        this.gameApi = new GameApi(game, playerId);
        this.sandbox = {
            // Game API
            Game: this.gameApi,

            // Overridden ES6 functionality
            console: { log: text => this.game.log(this.playerId, text) },

            // General AppLab functions
            randomNumber: (a, b) => Math.floor(Math.random() * (b - a + 1)) + a,
            appendItem: (l, x) => l.push(x),
            insertItem: (l, i, x) => l.splice(i, 0, x),
            removeItem: (l, i) => l.splice(i, 1),

            // Robot movement
            moveForward: () => this.gameApi.moveForward(),
            turnRight: () => this.gameApi.turnRight(),
            turnLeft: () => this.gameApi.turnLeft(),
            canMove: dir => this.gameApi.canMove(dir),

            forward: '0',
            right: '1',
            backward: '2',
            left: '3',
        };
    }
}
