import DB from './db.js';

const db = new DB();
await db.start();
console.log('started db');
await db.addPlayer('test', '1', '2', '3', '4');
console.log('added player');
await db.getPlayers().then((players) => {
    console.log('players', players);
});
process.exit();
