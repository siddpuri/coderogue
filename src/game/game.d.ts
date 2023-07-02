import { Info } from '../shared/player_info.js';

import Server from '../server/server.js';

export default class Game {
    constructor(server: Server);
    start(): Promise<void>;
    addPlayer(info: Info): Promise<void>;
    createNewHandle(): number;
    getState(): any;
    players: Player[];
    respawn(player: Player): void;
}

declare class Player {
    authToken: string;
    onNewCode(): void;
    log: { toString(): string; };
}
