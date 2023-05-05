const words = [
    ['happy', 'cute', 'funny', 'silly', 'shy', 'sleepy', 'sneaky', 'zany'],
    ['red', 'orange', 'yellow', 'green', 'blue', 'purple', 'pink', 'black'],
    ['cat', 'dog', 'bird', 'fish', 'turtle', 'rabbit', 'hamster', 'snake'],
];

export default class Util {
    static getTextHandle(handle) {
        var result = [];
        for (let part of words) {
            result.push(part[handle % part.length]);
            handle = Math.floor(handle / part.length);
        }
        return result.join('-');
    }

    static getMaxHandle() {
        return words.reduce((a, l) => a * l.length, 1);
    }
}
