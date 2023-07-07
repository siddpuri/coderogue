import mysql, { RowDataPacket } from 'mysql2/promise';

import Config from './config.js';
import Server from './server.js';

export default class DB {
    connection!: mysql.Connection;

    constructor(
        readonly server: Server
    ) {}

    async start(): Promise<void> {
        try {
            await this.connect();
        } catch {
            await Config.tryToStartDb();
            await this.connect();
        }
        setInterval(() => this.query('SELECT 1'), 60 * 60 * 1000);
    }

    private async connect(): Promise<void> {
        let options = await Config.getDbConnectionOptions();
        this.connection = await mysql.createConnection(options);
    }

    private async query(query: string, parameters?: (string | number)[]): Promise<RowDataPacket[]> {
        let response = await this.connection.execute(query, parameters) as RowDataPacket[][];
        return response[0];
    }

    async loadPlayers(): Promise<RowDataPacket[]> {
        return await this.query('SELECT id, auth_token, handle FROM players');
    }

    async addPlayer(email: string, password: string, authToken: string): Promise<number> {
        await this.query(
            'INSERT INTO players (email, password, auth_token) VALUES (?, ?, ?)',
            [email, password, authToken]
        );
        let [response] = await this.query('SELECT LAST_INSERT_ID()');
        return response['LAST_INSERT_ID()'];
    }

    async updatePlayer(playerId: number, period: number, handle: number): Promise<void> {
        await this.query(
            'UPDATE players SET period = ?, handle = ? WHERE id = ?',
            [period, handle, playerId]
        );
    }

    async getPlayerByEmail(email: string): Promise<RowDataPacket[]> {
        return await this.query(
            'SELECT id, password, auth_token, handle FROM players WHERE email = ?',
            [email]
        );
    }

    async setPassword(id: number, password: string): Promise<void> {
        await this.query(
            'UPDATE players SET password = ? WHERE id = ?',
            [password, id]
        );
    }
}
