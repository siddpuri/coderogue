import constants from '../client/constants.js';

export default class Player {
    constructor(id, name, period, handle) {
        this.id = id;
        this.name = name;
        this.period = period;
        this.handle = handle;
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