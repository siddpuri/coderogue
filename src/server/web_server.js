import express from 'express';
import cookieParser from 'cookie-parser';
import compression from 'compression';

import Config from './config.js';

export default class WebServer {
  constructor(server) {
    this.server = server;
    this.app = express();
  }

  async start() {
    this.app.use(express.json());
    this.app.use(cookieParser());
    this.app.use(compression());

    this.app.use(express.static('static'));
    this.app.use(express.static('src/shared'));
    this.app.use(express.static('src/client'));

    this.app.post('/api/login', async (req, res, next) => {
        try {
            res.json(await this.server.auth.login(req.body));
        } catch (err) {
            next(err);
        }
    });

    this.app.get('/api/state', (req, res) => {
        res.json(this.server.game.getState());
    });

    this.app.post('/api/respawn', (req, res) => {
        let playerId = this.validatePlayerId(req, res);
        if (!playerId) return;
        let player = this.server.game.players[playerId];
        this.server.game.respawn(player);
        res.json({});
    });

    this.app.get('/api/code', async (req, res) => {
        try {
            let playerId = this.validatePlayerId(req, res);
            if (!playerId) return;
            let code = await this.server.repositories.readCode(playerId);
            res.json({ code });
        } catch (err) {
            next(err);
        }
    });

    this.app.post('/api/code', async (req, res) => {
        try {
            let playerId = this.validatePlayerId(req, res);
            if (!playerId) return;
            await this.server.repositories.writeCode(playerId, req.body.code);
            this.server.game.players[playerId].onNewCode();
            res.json({});
        } catch (err) {
            next(err);
        }
    });

    this.app.get('/api/log', (req, res) => {
        let playerId = this.validatePlayerId(req, res);
        if (!playerId) return;
        let log = this.server.game.players[playerId].log.toString();
        res.json({ log });
    });

    this.app.use((err, req, res, next) => {
        console.log(err);
        res.status(500).json({ error: 'Internal server error: ' + err.message });
    });

    let port = await Config.getWebServerPort();
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
        res.json({ error: 'Not logged in.' });
        return null;
    }
    return playerId;
  }
}
