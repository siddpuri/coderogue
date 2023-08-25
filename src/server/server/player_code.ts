import path from 'path';
import fs from 'fs/promises';
import url from 'url';

import Server from './server.js';
import Config from './config.js';

export default class PlayerCode {
    root = Config.getPlayerRoot();
    templateCode!: string;
    defaultCode!: string;

    constructor(
        readonly server: Server
    ) {
        if (this.root.startsWith('~/') && process.env.HOME) {
            this.root = path.join(process.env.HOME, this.root.slice(2));
        }
    }

    async start(): Promise<void> {
        await fs.mkdir(this.root, { recursive: true });
        this.templateCode = await this.readStaticCode('template.js');
        this.templateCode = this.templateCode.replace(/\n/g, ' ');
        this.defaultCode = await this.readStaticCode('default.js');
    }

    async readCode(playerId: number): Promise<string> {
        let code = this.defaultCode;
        try {
            code = await fs.readFile(this.filePath(playerId), 'utf-8');
        }
        catch (e) { /* ignore */ }
        return code;
    }

    async writeCode(playerId: number, code: string): Promise<void> {
        let filePath = this.filePath(playerId);
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
        let myPath = new url.URL(import.meta.url).pathname;
        let dir = path.join(path.dirname(myPath), '..', '..', '..', 'player_code');
        return await fs.readFile(path.join(dir, name), 'utf-8');
    }

    private filePath(playerId: number): string {
        return path.join(this.root, playerId.toString(), 'player.js');
    }
}
