import bcrypt from 'bcrypt';
import crypto from 'crypto';

export default class Auth {
    constructor(server) {
        this.server = server;
    }

    async login(credentials) {
        let dbEntry = await this.server.db.getPlayer(credentials.email);
        if (!dbEntry) return await createAccount(credentials);
        if (!bcrypt.compare(credentials.password, dbEntry.password)) {
            return { error: "Incorrect password" };
        }
        return { authToken: dbEntry.auth_token };
    }

    async createAccount(credentials) {
        const authToken = crypto.randomBytes(16).toString('hex');
        let playerId = await this.server.db.addPlayer(credentials.email, credentials.password, authToken);
        // TODO: send email
    }
}