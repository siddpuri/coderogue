import GameServer from "./game_server.js";
import WebServer from "./web_server.js";

const GameServer = new GameServer();
const webServer = new WebServer();

gameServer.start();
webServer.start(gameServer);