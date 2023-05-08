import express from 'express';
import bodyParser from 'body-parser';

const port = 8080;

export default class WebServer {
  constructor(server) {
    this.server = server;
    this.app = express();
  }

  async start() {
    this.app.use(bodyParser.json());

    this.app.use(express.static('shared'));
    this.app.use(express.static('client'));

    this.app.get('/api/state', (req, res) => {
      let response = this.server.game.getState();
      res.send(JSON.stringify(response));
    });

    this.app.post('/api/login', async (req, res) => {
      let response = await this.server.auth.login(req.body);
      res.send(JSON.stringify(response));
    });

    this.app.listen(port, () => {
      console.log(`Web server listening on port ${port}`);
    });
  }
}
