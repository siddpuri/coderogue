import Server from './server.js';

const server = new Server();
await server.start();

try {
    await server.db.addPlayer('test', '1', '2', '3', '4');
} catch (e) {
    console.log(e);
}

console.log(server.db.players);