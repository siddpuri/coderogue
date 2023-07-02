import Game from '../game/game.js';

import Auth from './auth.js';
import DB from './db.js';
import Repositories from './repositories.js';
import WebServer from './web_server.js';

export default class Server {
    readonly db = new DB(this);
    readonly auth = new Auth(this);
    readonly repositories = new Repositories(this);
    readonly game = new Game(this);
    readonly webServer = new WebServer(this);

    async start() {
        await this.db.start();
        await this.repositories.start();
        await this.game.start();
        await this.webServer.start();
    }
}
