import PlayerInfo from '#ts/shared/player_info.js';

import CircularLog from './circular_log.js';

export default class Player extends PlayerInfo {
    constructor(info) {
        super(info);
        this.authToken = info.auth_token;
        this.action = null;
        this.log = new CircularLog(1000);
        this.turns = 0;
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
