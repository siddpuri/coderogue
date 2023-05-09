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

    this.app.get('/api/state', (req, res) => {
      let response = this.server.game.getState();
      res.send(JSON.stringify(response));
    });

    this.app.get('/api/code', async (req, res) => {
      let playerId = this.validatePlayerId(req);
      let code = playerId?
        this.server.game.players[playerId].code:
        'Please log in to see your code.';
      res.send(JSON.stringify(code));
    });

    this.app.post('/api/login', async (req, res) => {
      let response = await this.server.auth.login(req.body);
      res.send(JSON.stringify(response));
    });

    this.app.listen(port, () => {
      console.log(`Web server listening on port ${port}`);
    });
  }

  validatePlayerId(req) {
    let playerId = req.cookies.playerId;
    let authToken = req.cookies.authToken;
    if (!playerId || !authToken) {
      return undefined;
    }
    if (this.server.game.players[playerId].authToken != authToken) {
      return undefined;
    }
    return playerId;
  }
}
