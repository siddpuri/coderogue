import Server from '../server/server.js';

const server = new Server();
await server.db.start();
const handle = Math.floor(Math.random() * 512);
const email = 'spuri' + handle;
const password = 'password';
const auth_token = Math.floor(Math.random() * 65536);
const id = await server.db.addPlayer(email, password, auth_token);
await server.db.updatePlayer(id, 0, handle);
process.exit();
