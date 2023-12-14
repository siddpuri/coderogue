import Config from './config.js';
import Auth from './auth.js';
import DB from './db.js';
import PlayerCode from './player_code.js';
import WebServer from './web_server.js';

import Game from '../game/game.js';

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
        this.setSchedule();
    }

    setSchedule() {
        setTimeout(this.save.bind(this), Config.getSaveTime().getTime() - Date.now());
        setTimeout(this.stop.bind(this), Config.getStopTime().getTime() - Date.now());
    }

    async save(): Promise<void> {
        console.log('Saving game state...');
        await this.game.saveScores();
    }

    stop(): void {
        console.log('Stopping server...');
        process.exit(0);
    }
}
