import bcrypt from 'bcrypt';
import crypto from 'crypto';

import Util from '../shared/util.js';

export default class Auth {
    constructor(server) {
        this.server = server;
    }

    async login(credentials) {
        let [dbEntry] = await this.server.db.getPlayer(credentials.email);
        if (!dbEntry) return await this.createAccount(credentials);
        if (!await bcrypt.compare(credentials.password, dbEntry.password)) {
            return { error: "Incorrect password" };
        }
        let playerId = dbEntry.id;
        let authToken = dbEntry.auth_token;
        let handle = Util.getTextHandle(dbEntry.handle);
        return { playerId, authToken, handle };
    }

    async createAccount(credentials) {
        // TODO: This will need to change in order to validate accounts.
        const email = credentials.email;
        const password = await bcrypt.hash(credentials.password, 10);
        const authToken = crypto.randomBytes(16).toString('hex');
        let playerId = await this.server.db.addPlayer(email, password, authToken);
        let handle = this.server.game.createNewHandle();
        await this.server.db.updatePlayer(playerId, 0, handle);
        handle = Util.getTextHandle(handle);
        return { playerId, authToken, handle };
    }

    async validateCredentials(playerId, authToken) {
        let [dbEntry] = await this.server.db.getPlayer(playerId);
        if (!dbEntry) return false;
        return dbEntry.auth_token == authToken;
    }
}