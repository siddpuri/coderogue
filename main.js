import Game from './game/game.js';
import WebServer from './server/web_server.js';

const game = new Game();
const webServer = new WebServer(game);

game.start();
webServer.start(game);