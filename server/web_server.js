import express from 'express';

export default class WebServer {
  constructor(server) {
    this.server = server;
    this.app = express();
  }

  async start() {
    this.app.use(express.static('client'));

    this.app.post('/api/update/:user', (req, res) => {
        const user = req.params.user;
        // TODO
    });

    const port = this.server.settings.webServerPort;
    this.app.listen(port, () => {
      console.log(`Web server listening on port ${port}`);
    });
  }
}