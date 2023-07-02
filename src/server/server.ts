import Game from '#js/game/game.js';

import Auth from './auth.js';
import DB from './db.js';
import Repositories from './repositories.js';
import WebServer from './web_server.js';

export default class Server {
    db: DB;
    auth: Auth;
    repositories: Repositories;
    game: Game;
    webServer: WebServer;

    constructor() {
        this.db = new DB(this);
        this.auth = new Auth(this);
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
