import PlayerInfo, { Info } from '../shared/player_info.js';

import CircularLog from './circular_log.js';

export type InfoPlus = Info & { auth_token: string };

export default class Player extends PlayerInfo {
    readonly authToken: string;
    readonly log = new CircularLog(1000);
    action: (() => void) | null = null;;
    turns = 0;

    constructor(info: InfoPlus) {
        super(info);
        this.authToken = info.auth_token;
    }

    useTurn() {
        if (this.turns > 0) {
            this.turns--;
            return true;
        } else {
            this.log.write('Tried to do multiple actions in a turn.');
            return false;
        }
    }

    onNewCode() {
        this.action = null;
        this.idle = 0;
        this.offenses = 0;
        this.jailtime = 0;
        this.log.write('New code loaded.');
    }
}
