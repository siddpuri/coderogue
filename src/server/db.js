import mysql from 'mysql2/promise';

import Config from './config.js';

export default class DB {
    constructor(server) {
        this.server = server;
    }

    async start() {
        try {
            await this.connect();
        } catch {
            await Config.tryToStartDb();
            await this.connect();
        }
        this.heartbeat = setInterval(() => this.query('SELECT 1'), 60 * 60 * 1000);
    }

    async connect() {
        let options = await Config.getDbConnectionOptions();
        this.connection = await mysql.createConnection(options);
    }

    async query(query, parameters) {
        let [rows] = await this.connection.execute(query, parameters);
        return rows;
    }

    async loadPlayers() {
        return await this.query('SELECT id, auth_token, handle FROM players');
    }

    async addPlayer(email, password, authToken) {
        await this.query(
            'INSERT INTO players (email, password, auth_token) VALUES (?, ?, ?)',
            [email, password, authToken]
        );
        let [response] = await this.query('SELECT LAST_INSERT_ID()');
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
            'SELECT id, password, auth_token, handle FROM players WHERE email = ?',
            [email]
        );
    }

    async setPassword(id, password) {
        await this.query(
            'UPDATE players SET password = ? WHERE id = ?',
            [password, id]
        );
    }
}
