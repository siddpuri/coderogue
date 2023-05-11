import Level from '../game/level.js';

export default class BlockLevel extends Level {
    constructor(server) {
        super(server);
    }

    score(player) { player.score += 200; }
    bump(player) { super.bump(player); player.score--; }
    get spawnTargetPos() { return super.exitPos; }
    get exitPos() { return super.spawnTargetPos; }

    async doLevelAction() {
        // Move walls
    }
}
