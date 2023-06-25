import util from 'util';
import { exec } from 'child_process';
const execAsync = util.promisify(exec);

async function hostStartsWith(prefix) {
    let result = await execAsync('hostname', { encoding: 'utf8' });
    return result.stdout.startsWith(prefix);
}

export default class Config {
    static async getWebServerPort() {
        let port = 8080;
        if (await hostStartsWith('ip-')) port = 80;
        return port;
    }

    static async getDbConnectionOptions() {
        let options = {
            host:     '127.0.0.1',
            user:     'game',
            password: 'game',
            database: 'game',
        };
        if (await hostStartsWith('codespaces-')) {
            options.port = '/var/run/mysqld/mysqld.sock';
        }
        return options;
    }

    static async tryToStartDb() {
        if (await hostStartsWith('codespaces-')) {
            await execAsync('sudo service mysql start');
        }
    }
}
