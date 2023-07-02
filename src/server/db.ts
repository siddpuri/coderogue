import mysql from 'mysql2/promise';

import Config from './config.js';
import Server from './server.js';

export default class DB {
    connection!: mysql.Connection;

    constructor(
        readonly server: Server
    ) {}

    async start() {
        try {
            await this.connect();
        } catch {
            await Config.tryToStartDb();
            await this.connect();
        }
        setInterval(() => this.query('SELECT 1'), 60 * 60 * 1000);
    }

    async connect() {
        let options = await Config.getDbConnectionOptions();
        this.connection = await mysql.createConnection(options);
    }

    async query(query: string, parameters?: (string | number)[]) {
        let [rows] = await this.connection.execute(query, parameters);
        return rows;
    }

    async loadPlayers() {
        return await this.query('SELECT id, auth_token, handle FROM players') as mysql.RowDataPacket[];
    }

    async addPlayer(email: string, password: string, authToken: string) {
        await this.query(
            'INSERT INTO players (email, password, auth_token) VALUES (?, ?, ?)',
            [email, password, authToken]
        );
        let [response] = await this.query('SELECT LAST_INSERT_ID()') as mysql.RowDataPacket[];
        return response['LAST_INSERT_ID()'];
    }

    async updatePlayer(playerId: number, period: number, handle: number) {
        await this.query(
            'UPDATE players SET period = ?, handle = ? WHERE id = ?',
            [period, handle, playerId]
        );
    }

    async getPlayerByEmail(email: string) {
        return await this.query(
            'SELECT id, password, auth_token, handle FROM players WHERE email = ?',
            [email]
        ) as mysql.RowDataPacket[];
    }

    async setPassword(id: number, password: string) {
        await this.query(
            'UPDATE players SET password = ? WHERE id = ?',
            [password, id]
        );
    }
}
