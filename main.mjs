import Game from './game/game.mjs';
import WebServer from './server/web_server.mjs';

const game = new Game();
const webServer = new WebServer(game);

game.start();
webServer.start(game);