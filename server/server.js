import Game from '../game/game.js';
import DB from '../db/db.js';

export class Server {
    constructor(game) {
        this.game = game;
        this.db = new DB();
        this.game = new Game(this);
    }

    start() {
    }
}
