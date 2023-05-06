import express from 'express';

const port = 8080;

export default class WebServer {
  constructor(server) {
    this.server = server;
    this.app = express();
  }

  async start() {
    this.app.use(express.static('shared'));
    this.app.use(express.static('client'));

    this.app.get('/api/map', (req, res) => {
      let response = this.server.game.levels[0].map;
      res.send(JSON.stringify(response));
    });

    this.app.post('/api/update/:user', (req, res) => {
        const user = req.params.user;
        // TODO
    });

    this.app.listen(port, () => {
      console.log(`Web server listening on port ${port}`);
    });
  }
}
