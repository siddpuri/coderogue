import Util from './util.js';

const words = [
    ['happy', 'cute', 'funny', 'silly', 'shy', 'sleepy', 'sneaky', 'zany'],
    ['red', 'orange', 'yellow', 'green', 'blue', 'purple', 'pink', 'black'],
    ['cat', 'dog', 'bird', 'fish', 'turtle', 'rabbit', 'hamster', 'snake'],
];

export default class Handles {
    static getTextHandle(handle: number) {
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
}
