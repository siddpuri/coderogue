import Server from './server.js';

const server = new Server();
await server.start();

await server.db.addPlayer('test', '1', '2', '3', '4');
console.log(server.db.players);