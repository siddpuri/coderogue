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
        let getId = this.validatePlayerId.bind(this);
        let port = await Config.getWebServerPort();

        this.app.use(express.json());
        this.app.use(cookieParser());
        this.app.use(compression());

        this.app.use(express.static('static'));
        this.app.use(express.static('src/shared'));
        this.app.use(express.static('src/client'));

        this.app.get('/api/state', this.getState.bind(this));
        this.app.get('/api/code', getId, this.getCode.bind(this));
        this.app.get('/api/log', getId, this.getLog.bind(this));

        this.app.post('/api/login', this.login.bind(this));
        this.app.post('/api/respawn', getId, this.respawn.bind(this));
        this.app.post('/api/code', getId, this.setCode.bind(this));

        this.app.use(this.errorHandler.bind(this));

        this.app.listen(port, () => {
            console.log(`Web server listening on port ${port}`)
        });
    }

    getState(req, res) {
        res.json(this.server.game.getState());
    }

    async getCode(req, res, next) {
        try {
            let code = await this.server.repositories.readCode(req.playerId);
            res.json({ code });
        } catch (err) {
            next(err);
        }
    }

    getLog(req, res) {
        let log = this.server.game.players[req.playerId].log.toString();
        res.json({ log });
    }

    async login(req, res, next) {
        try {
            res.json(await this.server.auth.login(req.body));
        } catch (err) {
            next(err);
        }
    }

    respawn(req, res) {
        let player = this.server.game.players[req.playerId];
        this.server.game.respawn(player);
        res.json({});
    }

    async setCode(req, res, next) {
        try {
            await this.server.repositories.writeCode(req.playerId, req.body.code);
            this.server.game.players[req.playerId].onNewCode();
            res.json({});
        } catch (err) {
            next(err);
        }
    }

    validatePlayerId(req, res, next) {
        let playerId = req.cookies.playerId;
        let authToken = req.cookies.authToken;
        if (
            playerId &&
            authToken &&
            this.server.game.players[playerId] &&
            this.server.game.players[playerId].authToken == authToken
        ) {
            req.playerId = playerId;
            next();
        }
        else {
            res.status(401).json({ error: 'Not logged in.' });
        }
    }

    errorHandler(err, req, res, next) {
        console.log(err);
        let result = { error: `Internal server error: ${err.message}` };
        res.status(500).json(result);
    }
}
