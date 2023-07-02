import bcrypt from 'bcrypt';
import crypto from 'crypto';

import Handles from '../shared/handles.js';

import Server from './server.js';
import { InfoPlus } from '../game/player.js';

export type Credentials  = {
    email: string;
    password: string;
};

export type LoginResponse = {
    playerId: number;
    authToken: string;
    textHandle: string;
} | {
    error: string;
}

export default class Auth {
    constructor(
        readonly server: Server
    ) {}

    async login(credentials: Credentials): Promise<LoginResponse> {
        let [dbEntry] = await this.server.db.getPlayerByEmail(credentials.email);
        if (!dbEntry) {
            await this.createAccount(credentials);
            [dbEntry] = await this.server.db.getPlayerByEmail(credentials.email);
            await this.server.game.addPlayer(dbEntry as InfoPlus);
        } else if (!dbEntry.password) {
            await this.setPassword(dbEntry.id, credentials);
            [dbEntry] = await this.server.db.getPlayerByEmail(credentials.email);
        }
        if (!await bcrypt.compare(credentials.password, dbEntry.password)) {
            return { error: "Incorrect password" };
        }
        let playerId = dbEntry.id;
        let authToken = dbEntry.auth_token;
        let textHandle = Handles.getTextHandle(dbEntry.handle);
        return { playerId, authToken, textHandle };
    }

    async createAccount(credentials: Credentials) {
        // TODO: This will need to change in order to validate accounts.
        const email = credentials.email;
        const password = await bcrypt.hash(credentials.password, 10);
        const authToken = crypto.randomBytes(16).toString('hex');
        let playerId = await this.server.db.addPlayer(email, password, authToken);
        let handle = this.server.game.createNewHandle();
        await this.server.db.updatePlayer(playerId, 0, handle);
    }

    async setPassword(id: number, credentials: Credentials) {
        let password = await bcrypt.hash(credentials.password, 10);
        await this.server.db.setPassword(id, password)
    }
}
