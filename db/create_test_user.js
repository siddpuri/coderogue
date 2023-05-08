import Server from '../server/server.js';

const server = new Server();
await server.db.start();
const email = 'spuri';
const credentials = { email: 'spuri', password: 'password' };
for (let i = 0; i < 5; i++) {
    credentials.email = email + i;
    await server.auth.createAccount(credentials);
}
process.exit();
