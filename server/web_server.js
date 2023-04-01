import express from 'express';

const port = 8080;

export class WebServer {
  constructor(game) {
    this.game = game;
    this.app = express();
  }

  start() {
    this.app.use(express.static('client'));

    this.app.post('/api/update/:user', (req, res) => {
        const user = req.params.user;
        // TODO
    });

    this.app.listen(port, () => {
      console.log(`Web server listening on port ${port}`);
    });
  }
}