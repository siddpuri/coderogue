export default class Settings {
    constructor() {
        this.dbParameters = {
            host: 'localhost',
            port: '/var/run/mysqld/mysqld.sock',
            user: 'game',
            password: 'game',
        };

        this.webServerPort = 8080;

        this.playerRoot = '~/players';
    }
}