import mysql, { RowDataPacket } from 'mysql2/promise';

import Config from './config.js';
import Server from './server.js';

export type PlayerEntry = {
    id: number;
    email: string;
    password: string;
    auth_token: string;
    handle: number;
    score: number;
    best_ttc: number | null;
    grownup: boolean;
    teacher: boolean;
}

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

    async loadPlayers(): Promise<PlayerEntry[]> {
        let result = await this.query('SELECT * FROM players');
        return result as PlayerEntry[];
    }

    async addPlayer(email: string, password: string, authToken: string): Promise<number> {
        await this.query(
            'INSERT INTO players (email, password, auth_token) VALUES (?, ?, ?)',
            [email, password, authToken]
        );
        let [response] = await this.query('SELECT LAST_INSERT_ID()');
        return response['LAST_INSERT_ID()'];
    }

    async updatePlayer(playerId: number, handle: number): Promise<void> {
        await this.query(
            'UPDATE players SET handle = ? WHERE id = ?',
            [handle, playerId]
        );
    }

    async getPlayerByEmail(email: string): Promise<PlayerEntry[]> {
        let result = await this.query(
            'SELECT * FROM players WHERE email = ?',
            [email]
        );
        return result as PlayerEntry[];
    }

    async setPassword(id: number, password: string): Promise<void> {
        await this.query(
            'UPDATE players SET password = ? WHERE id = ?',
            [password, id]
        );
    }

    async addScore(id: number, score: number): Promise<void> {
        await this.query(
            'UPDATE players SET score = score + ? WHERE id = ?',
            [score, id]
        );
    }

    async updateBestTtc(id: number, ttc: number): Promise<void> {
        await this.query(
            'UPDATE players SET best_ttc = ? WHERE id = ?',
            [ttc, id]
        );
    }
}
