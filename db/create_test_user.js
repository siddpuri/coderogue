import Server from '../server/server.js';

const server = new Server();
await server.db.start();
await server.db.addPlayer('Diss Irup', '2', '', 42);
process.exit();
