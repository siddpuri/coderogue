import Settings from '../settings.js';
import DB from '../db/db.js';
import Game from '../game/game.js';
import WebServer from '../webserver/webserver.js';

export default class Server {
    constructor() {
        this.settings = new Settings();
        this.db = new DB(this);
        this.game = new Game(this);
        this.webServer = new WebServer(this);
    }

    start() {
    }
}
