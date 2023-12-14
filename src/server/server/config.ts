import util from 'util';
import { exec } from 'child_process';
const execAsync = util.promisify(exec);
import mysql from 'mysql2/promise';

export default class Config {
    static async getWebServerPort(): Promise<number> {
        let port = 8080;
        if (await this.hostStartsWith('ip-')) port = 80;
        return port;
    }

    static async getDbConnectionOptions(): Promise<mysql.ConnectionOptions> {
        let options: mysql.ConnectionOptions = {
            host:     '127.0.0.1',
            user:     'game',
            password: 'game',
            database: 'game',
        };
        if (await this.hostStartsWith('codespaces-')) {
            // mysql.ConnectionOptions incorrectly specifies port as a number.
            options.port = '/var/run/mysqld/mysqld.sock' as unknown as number;
        }
        return options;
    }

    static async tryToStartDb(): Promise<void> {
        if (await this.hostStartsWith('codespaces-')) {
            await execAsync('sudo service mysql start');
        }
    }

    static getPlayerRoot(): string { return '~/players'; }

    static getSaveTime(): Date { return this.getFutureTime(7); }
    static getStopTime(): Date { return this.getFutureTime(1); }

    private static async hostStartsWith(prefix: string): Promise<boolean> {
        let result = await execAsync('hostname', { encoding: 'utf8' });
        return result.stdout.startsWith(prefix);
    }
    
    private static getFutureTime(hours: number): Date {
        let time = new Date();
        time.setHours(hours, 0, 0, 0);
        if (time.getTime() < Date.now()) time.setDate(time.getDate() + 1);
        return time;
    }
}
