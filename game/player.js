import Util from '../shared/util.js';

import CircularLog from './circular_log.js';

export default class Player {
    constructor(dbEntry) {
        // Database columns
        this.id = dbEntry.id;
        this.name = dbEntry.name;
        this.period = dbEntry.period;
        this.handle = dbEntry.handle;
        this.score = dbEntry.score;

        // Game plumbing
        this.textHandle = Util.getTextHandle(this.handle);
        this.code = undefined;
        this.action = undefined;
        this.log = new CircularLog(1000);

        // Game state
        this.level = undefined;
        this.pos = undefined;
        this.dir = 0;
        this.turns = 0;
    }

    grantTurns(turns) {
        this.turns += turns;
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

    getState() {
        return {
            id: this.id,
            period: this.period,
            textHandle: this.textHandle,
            score: this.score,
            level: this.level,
            pos: this.pos,
            dir: this.dir,
        };
    }
}
