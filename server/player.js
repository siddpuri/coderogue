import constants from '../client/constants.js';

export default class Player {
    constructor(dbEntry) {
        this.id = dbEntry.id;
        this.name = dbEntry.name;
        this.period = dbEntry.period;
        this.handle = dbEntry.handle;
        this.score = dbEntry.score;
    }

    get textHandle() {
        var h = this.handle;
        var result = [];
        for (let part of constants.words) {
            result.push(part[h % part.length]);
            h = Math.floor(h / part.length);
        }
        return result.join('-');
    }
}