import Level from '../game/level.js';

export default class IntroLevel extends Level {
    constructor(server) {
        super(server);
    }

    get name() { return 'The Plains'; }

    score(player) {
        player.score += 100;
        super.score();
    }
}
