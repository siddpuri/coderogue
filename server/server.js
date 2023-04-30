import Settings from './settings.js';
import Repositories from './repositories.js';
import WebServer from './web_server.js';

import DB from '../db/db.js';
import Game from '../game/game.js';

export default class Server {
    constructor() {
        this.settings = new Settings();
        this.db = new DB(this);
        this.repositories = new Repositories(this);
        this.game = new Game(this);
        this.webServer = new WebServer(this);
    }

    async start() {
        await this.db.start();
        await this.repositories.start();
        await this.game.start();
        await this.webServer.start();
    }
}