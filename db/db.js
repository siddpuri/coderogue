import mysql from 'mysql';
import util from 'util';

const dbParameters = {
    host: 'localhost',
    user: 'game',
    password: 'game',
};

export default class DB {
    constructor(server) {
        this.server = server;
        const connection = mysql.createConnection(dbParameters);
        this.query = util.promisify(connection.query).bind(connection);
    }

    async start() {
        await this.query('USE game');
        this.heartbeat = setInterval(() => this.query('SELECT 1'), 60 * 60 * 1000);
    }

    async loadPlayers() {
        return await this.query('SELECT * FROM players');
    }

    async addPlayer(email, password, authToken) {
        await this.query(
            'INSERT INTO players (email, password, auth_token) VALUES (?, ?, ?)',
            [email, password, authToken]
        );
        const [response] = await this.query('SELECT LAST_INSERT_ID()');
        return response['LAST_INSERT_ID()'];
    }

    async updatePlayer(playerId, period, handle) {
        await this.query(
            'UPDATE players SET period = ?, handle = ? WHERE id = ?',
            [period, handle, playerId]
        );
    }

    async getPlayerByEmail(email) {
        return await this.query(
            'SELECT * FROM players WHERE email = ?',
            [email]
        );
    }
}
