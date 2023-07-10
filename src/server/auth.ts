import bcrypt from 'bcrypt';
import crypto from 'crypto';

import { LoginRequest, LoginResponse, ErrorResponse } from '../shared/protocol.js';
import Handles from '../shared/handles.js';

import Server from './server.js';

export default class Auth {
    constructor(
        readonly server: Server
    ) {}

    async login(credentials: LoginRequest): Promise<LoginResponse | ErrorResponse> {
        let [dbEntry] = await this.server.db.getPlayerByEmail(credentials.email);
        if (!dbEntry) {
            await this.createAccount(credentials);
            [dbEntry] = await this.server.db.getPlayerByEmail(credentials.email);
            this.server.game.addPlayer(dbEntry);
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

    async createAccount(credentials: LoginRequest): Promise<void> {
        // TODO: This will need to change in order to validate accounts.
        const email = credentials.email;
        const password = await bcrypt.hash(credentials.password, 10);
        const authToken = crypto.randomBytes(16).toString('hex');
        let playerId = await this.server.db.addPlayer(email, password, authToken);
        let handle = this.server.game.createNewHandle();
        await this.server.db.updatePlayer(playerId, 0, handle);
    }

    async setPassword(id: number, credentials: LoginRequest): Promise<void> {
        let password = await bcrypt.hash(credentials.password, 10);
        await this.server.db.setPassword(id, password)
    }
}
