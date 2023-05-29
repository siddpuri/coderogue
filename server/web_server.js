import express from 'express';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';

const port = 8080;

export default class WebServer {
  constructor(server) {
    this.server = server;
    this.app = express();
  }

  async start() {
    this.app.use(bodyParser.json());
    this.app.use(cookieParser());

    this.app.use(express.static('shared'));
    this.app.use(express.static('client'));
    this.app.use(express.static('client/static'));

    this.app.post('/api/login', async (req, res) => {
      let response = await this.server.auth.login(req.body);
      res.send(JSON.stringify(response));
    });

    this.app.get('/api/state', (req, res) => {
      let response = this.server.game.getState();
      res.send(JSON.stringify(response));
    });

    this.app.post('/api/respawn', (req, res) => {
      let playerId = this.validatePlayerId(req, res);
      if (!playerId) return;
      let player = this.server.game.players[playerId];
      this.server.game.respawn(player);
      res.send(JSON.stringify({}));
    });

    this.app.get('/api/code', async (req, res) => {
      let playerId = this.validatePlayerId(req, res);
      if (!playerId) return;
      let code = await this.server.repositories.readCode(playerId);
      res.send(JSON.stringify({ code }));
    });

    this.app.post('/api/code', async (req, res) => {
      let playerId = this.validatePlayerId(req, res);
      if (!playerId) return;
      await this.server.repositories.writeCode(playerId, req.body.code);
      this.server.game.players[playerId].onNewCode();
      res.send(JSON.stringify({}));
    });

    this.app.get('/api/log', (req, res) => {
      let playerId = this.validatePlayerId(req, res);
      if (!playerId) return;
      let log = this.server.game.players[playerId].log.toString();
      res.send(JSON.stringify({ log }));
    });

    this.app.post('/api/player', (req, res) => {
        let { playerId } = req.body;
        let playerInfo = this.server.game.players[playerId].getInfo();
        res.send(JSON.stringify(playerInfo));
    });

    this.app.use((err, req, res, next) => {
        console.log(err);
        res.status(500).json({ error: 'Internal server error: ' + err.message });
    });

    this.app.listen(port, () => {
      console.log(`Web server listening on port ${port}`);
    });
  }

  validatePlayerId(req, res) {
    let playerId = req.cookies.playerId;
    let authToken = req.cookies.authToken;
    if (
      !playerId ||
      !authToken ||
      !this.server.game.players[playerId] ||
      this.server.game.players[playerId].authToken != authToken
    ) {
      res.send(JSON.stringify({ error: 'Not logged in.' }));
      return undefined;
    }
    return playerId;
  }
}
