import mysql from 'mysql';

function throw_error(err, result) {
    if (err) throw err;
}

export default class DB {
    constructor() {
        this.db = mysql.createConnection({
            host: 'localhost',
            port: '/var/run/mysqld/mysqld.sock',
            user: 'game',
            password: 'game',
        });      
        this.db.query("USE game", throw_error);
    }

    reset() {
        const lines = [
            // CREATE USER 'game'@'localhost' IDENTIFIED WITH mysql_native_password BY 'game';
            // GRANT ALL PRIVILEGES ON game.* TO 'game'@'localhost';
            // GRANT CREATE, DROP on *.* to 'game'@'localhost';
            // FLUSH PRIVILEGES;
            "DROP DATABASE IF EXISTS game",
            "CREATE DATABASE game",
            "USE game",
            `CREATE TABLE players (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                period INT NOT NULL,
                handle VARCHAR(255) NOT NULL,
                password VARCHAR(255) NOT NULL,
                UNIQUE (handle)
            )`,
        ];
        for (let line of lines) {
            this.db.query(line, throw_error);
        }
    }
}