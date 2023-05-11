import Level from '../game/level.js';

export default class IntroLevel extends Level {
    constructor(server) {
        super(server);
    }

    score(player) { player.score += 100; }
}
