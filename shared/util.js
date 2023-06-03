const words = [
    ['happy', 'cute', 'funny', 'silly', 'shy', 'sleepy', 'sneaky', 'zany'],
    ['red', 'orange', 'yellow', 'green', 'blue', 'purple', 'pink', 'black'],
    ['cat', 'dog', 'bird', 'fish', 'turtle', 'rabbit', 'hamster', 'snake'],
];

export default class Util {
    static randomInt(min, max) {
        return Math.floor(Math.random() * (max - min)) + min;
    }

    static randomElement(list) {
        return list[Math.floor(Math.random() * list.length)];
    }

    static getTextHandle(handle) {
        let result = [];
        for (let part of words) {
            result.push(part[handle % part.length]);
            handle = Math.floor(handle / part.length);
        }
        return result.join('-');
    }

    static getMaxHandle() {
        return words.reduce((a, l) => a * l.length, 1);
    }

    static generateAutomatonHandle() {
        return [
            Util.randomElement(words[0]),
            Util.randomElement(words[1]),
            'automaton',
        ].join('-');
    }

    static stringify(obj) {
        if (Array.isArray(obj)) {
            return `[${obj.map(e => this.stringify(e)).join(', ')}]`;
        }
        return String(obj);
    }
}
