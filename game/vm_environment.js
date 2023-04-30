export default class VmEnvironment {
    constructor(game) {
        this.game = game;
    }

    getSandbox(player) {
        return {
            x: 10,
            randomNumber: (min, max) => this.randomNumber(min, max);
        };
    }

    randomNumber(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }
}