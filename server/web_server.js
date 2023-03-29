const express = require('express');

const port = 80;

export default class WebServer {
  constructor() {
    this.app = express();
  }

  start(game) {
    this.game = game;

    this.app.use(express.static('client'), {redirect: false});

    this.app.post('/api/update/:user', (req, res) => {
        const user = req.params.user;
        // TODO
    });

    this.app.listen(port, () => {
      console.log(`Web server listening on port ${port}`);
    });
  }
}