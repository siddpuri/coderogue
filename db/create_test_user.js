import Server from '../server/server.js';

const server = new Server();
await server.db.start();
const handle = Math.floor(Math.random() * 512);
await server.db.addPlayer('spuri', '0', handle);
process.exit();
