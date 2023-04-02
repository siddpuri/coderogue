import mysql from 'mysql';
import util from 'util';

export default class DB {
    constructor() {
        const connection = mysql.createConnection({
            host: 'localhost',
            port: '/var/run/mysqld/mysqld.sock',
            user: 'game',
            password: 'game',
        });
        this.query = util.promisify(connection.query).bind(connection);
    }

    async start() {
        await this.query("USE game");
    }

    async addPlayer(name, period, handle, password) {
        await this.db.query(
            "INSERT INTO players (name, period, handle, password) VALUES (?, ?, ?, ?)",
            [name, period, handle, password]
        );
    }

    async getPlayers() {
        return await this.db.query("SELECT * FROM players");
    }
}
