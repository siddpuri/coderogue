import path from 'path';
import fs from 'fs/promises';

import Server from './server.js';
import Config from './config.js';

export default class PlayerCode {
    templateCode!: string;
    defaultCode!: string;

    constructor(
        readonly server: Server
    ) {}

    async start(): Promise<void> {
        await fs.mkdir(Config.getPrivateDir(), { recursive: true });
        this.templateCode = await this.readStaticCode('template.js');
        this.templateCode = this.templateCode.replace(/\n/g, ' ');
        this.defaultCode = await this.readStaticCode('default.js');
    }

    async readCode(playerId: number): Promise<string> {
        let code = this.defaultCode;
        let filePath = this.getPlayerFilePath(playerId);
        try {
            code = await fs.readFile(filePath, 'utf-8');
        }
        catch (e) { /* ignore */ }
        return code;
    }

    async writeCode(playerId: number, code: string): Promise<void> {
        let filePath = this.getPlayerFilePath(playerId);
        await fs.mkdir(path.dirname(filePath), { recursive: true });
        await fs.writeFile(filePath, code);
    }

    async readCodeAndWrap(playerId: number): Promise<string> {
        let playerCode = await this.readCode(playerId);
        // In case player code ends with a comment line or an error
        playerCode += '\n';
        let code = this.templateCode.replace('/* CODE */', playerCode);
        // This saves 25%, but it will break some players.
        // code = `(() => { ${code} })();`;
        return code;
    }

    private async readStaticCode(name: string): Promise<string> {
        let filePath = path.join(Config.getRootDir(), 'player_code', name);
        return await fs.readFile(filePath, 'utf-8');
    }

    private getPlayerFilePath(playerId: number): string {
        let name = playerId.toString().padStart(3, '0') + '.js';
        return path.join(Config.getPrivateDir(), 'player_code', name);
    }
}
