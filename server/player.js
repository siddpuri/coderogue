const words = [
    ['happy', 'cute', 'funny', 'silly', 'shy', 'sleepy', 'sneaky', 'zany'],
    ['red', 'orange', 'yellow', 'green', 'blue', 'purple', 'pink', 'black'],
    ['cat', 'dog', 'bird', 'fish', 'turtle', 'rabbit', 'hamster', 'snake'],
];

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
        for (let part of words) {
            result.push(part[h % part.length]);
            h = Math.floor(h / part.length);
        }
        return result.join('-');
    }
}