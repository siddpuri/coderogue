import Util from '../shared/util.js';

import CircularLog from './circular_log.js';

export default class Player {
    constructor(dbEntry) {
        // Database columns
        this.id = dbEntry.id;
        this.authToken = dbEntry.auth_token;
        this.period = dbEntry.period;
        this.handle = dbEntry.handle;
        this.score = dbEntry.score;

        // Game plumbing
        this.textHandle = Util.getTextHandle(this.handle);
        this.action = undefined;
        this.log = new CircularLog(1000);

        // Game state
        this.level = undefined;
        this.pos = undefined;
        this.dir = 0;
        this.turns = 0;
        this.idle = 0;
        this.timeouts = 0;
        this.jailtime = 0;
    }

    get levelNumber() {
        return this.level? this.level.levelNumber : 'jail';
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
        delete this.action;
        this.idle = 0;
        this.timeouts = 0;
        this.jailtime = 0;
        this.log.write('New code loaded.');
    }

    getState() {
        return {
            id: this.id,
            period: this.period,
            handle: this.textHandle,
            score: this.score,
            level: this.levelNumber,
            pos: this.pos,
            dir: this.dir,
        };
    }
}
