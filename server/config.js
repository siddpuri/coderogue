import { execSync } from 'child_process';

function run(command) {
    return execSync(command, { encoding: 'utf8' });
}

export default class Config {
    static get webServerPort() {
        let port = 8080;
        if (run('hostname').startsWith('ip-')) port = 80;
        return port;
    }

    static get dbConnectionOptions() {
        let options = {
            host:     '127.0.0.1',
            user:     'game',
            password: 'game',
            database: 'game',
        };
        if (run('hostname').startsWith('codespaces-')) {
            options.port = '/var/run/mysqld/mysqld.sock';
        }
        return options;
    }
}
