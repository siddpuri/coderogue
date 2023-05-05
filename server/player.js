import Util from '../shared/util.js';

export default class Player {
    constructor(dbEntry) {
        this.id = dbEntry.id;
        this.name = dbEntry.name;
        this.period = dbEntry.period;
        this.handle = dbEntry.handle;
        this.score = dbEntry.score;
    }

    get textHandle() {
        return Util.getTextHandle(this.handle);
    }
}
