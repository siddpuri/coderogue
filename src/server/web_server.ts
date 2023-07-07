import express from 'express';
import cookieParser from 'cookie-parser';
import compression from 'compression';

import Config from './config.js';
import Server from './server.js';

type Req = express.Request;
type Res = express.Response;
type Next = express.NextFunction;

export default class WebServer {
    readonly app = express();

    constructor(
        private readonly server: Server
    ) {}

    async start(): Promise<void> {
        let checkId = this.checkPlayerId.bind(this);
        let port = await Config.getWebServerPort();

        this.app.use(express.json());
        this.app.use(cookieParser());
        this.app.use(compression());

        this.app.use(express.static('static'));
        this.app.use(express.static('dist'));
        this.app.use(express.static('src/shared'));
        this.app.use(express.static('src/client'));

        this.app.get('/api/state', this.getState.bind(this));
        this.app.get('/api/code', checkId, this.getCode.bind(this));
        this.app.get('/api/log', checkId, this.getLog.bind(this));

        this.app.post('/api/login', this.login.bind(this));
        this.app.post('/api/respawn', checkId, this.respawn.bind(this));
        this.app.post('/api/code', checkId, this.setCode.bind(this));

        this.app.use(this.errorHandler.bind(this));

        this.app.listen(port, () => {
            console.log(`Web server listening on port ${port}`)
        });
    }

    private getState(req: Req, res: Res) {
        res.json(this.server.game.getState());
    }

    private async getCode(req: Req, res: Res, next: Next) {
        try {
            let code = await this.server.repositories.readCode(req.cookies.playerId);
            res.json({ code });
        } catch (err) {
            next(err);
        }
    }

    private getLog(req: Req, res: Res) {
        let log = this.server.game.players[req.cookies.playerId].log.toString();
        res.json({ log });
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
            await this.server.repositories.writeCode(playerId, req.body.code);
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

    private errorHandler: express.ErrorRequestHandler = (err, req, res, next) => {
        console.log(err);
        let result = { error: `Internal server error: ${err.message}` };
        res.status(500).json(result);
    }
}
