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

    this.app.post('/api/login', async (req, res) => {
      let response = await this.server.auth.login(req.body);
      res.send(JSON.stringify(response));
    });

    this.app.get('/api/state', (req, res) => {
      let response = this.server.game.getState();
      res.send(JSON.stringify(response));
    });

    this.app.get('/api/code', async (req, res) => {
      let playerId = this.validatePlayerId(req);
      if (!playerId) {
        res.send(JSON.stringify({error: 'Not logged in.'}));
        return;
      }
      let code = await this.server.repositories.readCode(playerId);
      res.send(JSON.stringify({ code }));
    });

    this.app.post('/api/code', async (req, res) => {
      let playerId = this.validatePlayerId(req);
      if (!playerId) {
        res.send(JSON.stringify({error: 'Not logged in.'}));
        return;
      }
      await this.server.repositories.writeCode(playerId, req.body.code);
      res.send(JSON.stringify({}));
    });

    this.app.get('/api/log', async (req, res) => {
      let playerId = this.validatePlayerId(req);
      if (!playerId) {
        res.send(JSON.stringify({error: 'Not logged in.'}));
        return;
      }
      let log = this.server.game.players[playerId].log.toString();
      res.send(JSON.stringify({ log }));
    });

    this.app.listen(port, () => {
      console.log(`Web server listening on port ${port}`);
    });
  }

  validatePlayerId(req) {
    let playerId = req.cookies.playerId;
    let authToken = req.cookies.authToken;
    if (
      !playerId ||
      !authToken ||
      !this.server.game.players[playerId] ||
      this.server.game.players[playerId].authToken != authToken
    ) {
      return undefined;
    }
    return playerId;
  }
}
