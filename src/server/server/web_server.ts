import http from 'http';
import https from 'https';

import express from 'express';
import cookieParser from 'cookie-parser';
import compression from 'compression';

import Config from './config.js';
import Server from './server.js';

type Req = express.Request;
type Res = express.Response;
type Next = express.NextFunction;

export default class WebServer {
    constructor(
        private readonly server: Server
    ) {}

    async start(): Promise<void> {
        let app = this.getApp();

        let httpPort = await Config.getHttpPort();
        http.createServer(app)
            .listen(httpPort, () => {
                console.log(`Http server listening on port ${httpPort}`);
            });

        let httpsPort = await Config.getHttpsPort();
        if (httpsPort) {
            https.createServer(await Config.getHttpsOptions(), app)
                .listen(httpsPort, () => {
                    console.log(`Https server listening on port ${httpsPort}`);
                });
        }
    }

    private getApp(): express.Express {
        let app = express();
        let checkId = this.checkPlayerId.bind(this);

        app.use(express.json());
        app.use(cookieParser());
        app.use(compression());

        app.use(express.static('dist/client'));
        app.use(express.static('dist/shared'));
        app.use(express.static('public'));

        app.get('/api/state', this.getState.bind(this));
        app.get('/api/code', checkId, this.getCode.bind(this));
        app.get('/api/log', checkId, this.getLog.bind(this));

        app.post('/api/login', this.login.bind(this));
        app.post('/api/respawn', checkId, this.respawn.bind(this));
        app.post('/api/code', checkId, this.setCode.bind(this));

        app.use(this.errorHandler.bind(this));

        return app;
    }

    private getState(req: Req, res: Res) {
        res.json(this.server.game.getState());
    }

    private async getCode(req: Req, res: Res, next: Next) {
        try {
            let code = await this.server.playerCode.readCode(req.cookies.playerId);
            res.json(code);
        } catch (err) {
            next(err);
        }
    }

    private getLog(req: Req, res: Res) {
        let log = this.server.game.players[req.cookies.playerId].log.getEntries();
        res.json(log);
    }

    private async login(req: Req, res: Res, next: Next) {
        try {
            res.json(await this.server.auth.login(req.body));
        } catch (err) {
            next(err);
        }
    }

    private respawn(req: Req, res: Res) {
        let player = this.server.game.players[req.cookies.playerId];
        this.server.game.respawn(player);
        res.json({});
    }

    private async setCode(req: Req, res: Res, next: Next) {
        let playerId = req.cookies.playerId;
        try {
            await this.server.playerCode.writeCode(playerId, req.body.code);
            this.server.game.players[playerId].onNewCode();
            res.json({});
        } catch (err) {
            next(err);
        }
    }

    private checkPlayerId(req: Req, res: Res, next: Next) {
        let playerId = req.cookies.playerId;
        let authToken = req.cookies.authToken;
        if (
            !playerId ||
            !authToken ||
            !this.server.game.players[playerId] ||
            this.server.game.players[playerId].authToken != authToken
        ) {
            res.status(401).json({ error: 'Not logged in.' });
        }
        else next();
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    private errorHandler(err: Error, req: Req, res: Res, next: Next) {
        console.log(err);
        let result = { error: `Internal server error: ${err.message}` };
        res.status(500).json(result);
    }
}
