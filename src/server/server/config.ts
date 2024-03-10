import util from 'util';
import https from 'https';
import fs from 'fs/promises';
import { exec } from 'child_process';
const execAsync = util.promisify(exec);
import url from 'url';
import path from 'path';
import mysql from 'mysql2/promise';

export default class Config {
    static async getHttpPort(): Promise<number> {
        return (await this.hostStartsWith('ip-'))? 80 : 8080;
    }

    static async getHttpsPort(): Promise<number | undefined> {
        return (await this.hostStartsWith('ip-'))? 443 : 8443;
    }

    static async getHttpsOptions(): Promise<https.ServerOptions> {
        let keyFile = path.join(this.getPrivateDir(), 'ssl.key');
        let certFile = path.join(this.getPrivateDir(), 'ssl.cert');
        return {
            key:  await fs.readFile(keyFile),
            cert: await fs.readFile(certFile),
        };
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

    static getRootDir(): string {
        let filePath = url.fileURLToPath(import.meta.url);
        while (filePath && !filePath.endsWith('coderogue')) {
            filePath = path.dirname(filePath);
        }
        return filePath;
    }

    static getPrivateDir(): string {
        return path.join(this.getRootDir(), 'private');
    }

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
