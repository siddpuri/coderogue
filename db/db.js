import mysql from 'mysql';
import util from 'util';

export default class DB {
    constructor(server) {
        this.server = server;
        const connection = mysql.createConnection(server.settings.dbParameters);
        this.query = util.promisify(connection.query).bind(connection);
    }

    async start() {
        await this.query("USE game");
    }

    async loadPlayers() {
        return await this.query("SELECT * FROM players");
    }

    async addPlayer(name, period, github_name, handle) {
        await this.query(
            "INSERT INTO players (name, period, github_name, handle) VALUES (?, ?, ?, ?)",
            [name, period, github_name, handle]
        );
    }

    async writeScores(players) {
        // TODO
    }
}
