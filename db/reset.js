import DB from './db.js';

// For initial setup, run this script as root:
//   CREATE DATABASE game;
//   CREATE USER 'game'@'localhost' IDENTIFIED WITH mysql_native_password BY 'game';
//   GRANT ALL PRIVILEGES ON game.* TO 'game'@'localhost';
//   GRANT CREATE, DROP on *.* to 'game'@'localhost';
//   FLUSH PRIVILEGES;

const resetScript = [
    "DROP DATABASE IF EXISTS game",
    "CREATE DATABASE game",
    "USE game",
    `CREATE TABLE players (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        period INT NOT NULL,
        handle INT NOT NULL,
        password VARCHAR(255) NOT NULL,
        UNIQUE (handle)
    )`,
]

const db = new DB();

for (let q of resetScript) await db.query(q);
