import Level from '../game/level.js';

export default class IntroLevel extends Level {
    get name() { return 'The Plains'; }
    isProtected(currentPlayer, pos) { return true; }
}
