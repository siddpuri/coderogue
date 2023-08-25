import Game from '../game/game.js';

import Auth from './auth.js';
import DB from './db.js';
import PlayerCode from './player_code.js';
import WebServer from './web_server.js';

export default class Server {
    readonly db = new DB(this);
    readonly auth = new Auth(this);
    readonly playerCode = new PlayerCode(this);
    readonly game = new Game(this);
    readonly webServer = new WebServer(this);

    async start(): Promise<void> {
        await this.db.start();
        await this.playerCode.start();
        await this.game.start();
        await this.webServer.start();
    }
}
