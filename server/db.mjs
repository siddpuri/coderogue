import mysql from 'mysql';

function throw_error(err, result) {
    if (err) throw err;
}

export default class DB {
    constructor() {
        this.db = mysql.createConnection({
            host: 'localhost',
            user: 'game',
            password: 'game',
        });      
        this.db.query("USE game", throw_error);
    }

    reset() {
        const lines = [
            // CREATE USER 'game'@'localhost' IDENTIFIED BY 'game';
            // GRANT ALL PRIVILEGES ON game.* TO 'game'@'localhost';
            // GRANT CREATE, DROP on *.* to 'game'@'localhost';
            // FLUSH PRIVILEGES;
            "DROP DATABASE IF EXISTS game",
            "CREATE DATABASE game",
            "USE game",
            `CREATE TABLE users (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                username VARCHAR(255) NOT NULL,
                password VARCHAR(255) NOT NULL,
                UNIQUE (name), UNIQUE (email)
            )`,
        ];
        for (let line of lines) {
            this.db.query(line, throw_error);
        }
    }
}