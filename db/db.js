import mysql from 'mysql';
import util from 'util';

import Player from '../server/player.js';

export default class DB {
    constructor(server) {
        this.server = server;
        const connection = mysql.createConnection(server.settings.dbParameters);
        this.query = util.promisify(connection.query).bind(connection);
    }

    async start() {
        await this.query("USE game");
        await this.refreshPlayers();
    }

    async addPlayer(name, period, handle, password, github_name) {
        await this.query(
            "INSERT INTO players (name, period, handle, password, github_name) VALUES (?, ?, ?, ?, ?)",
            [name, period, handle, password, github_name]
        );
        await this.refreshPlayers();
    }

    async removePlayer(id) {
        await this.query("DELETE FROM players WHERE id = ?", [id]);
        await this.refreshPlayers();
    }

    async refreshPlayers() {
        const response = await this.query("SELECT * FROM players");
        this.players = response.map(p => new Player(p.id, p.name, p.period, p.handle));
    }

    async readScores() {
        return await this.query("SELECT * FROM scores");
    }

    async writeScores(scores) {
        await this.query("DELETE FROM scores");
        for (let i = 0; i < scores.length; i++) {
            if (!scores) continue;
            await this.query("INSERT INTO scores (player, score) VALUES (?, ?)", [i, scores[i]]);
        }
    }
}
