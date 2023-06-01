import BlockLevel from './block_level.js';

export default class HunterLevel extends BlockLevel {
    constructor(server) {
        super(server);
        this.mobs = [];
    }

    get name() { return 'There Can Be Only One'; }
    get spawnTargetPos() { return [this.width / 2, this.height / 2]; }
    get exitPos() { return [0, 0]; }
    get killScore() { return 200; }

    isProtected(currentPlayer, pos) {
        return this.hasGrownupProtection(currentPlayer, pos);
    }

    doLevelAction() {
        super.doLevelAction();
        for (let player of this.server.game.players) {
            if (player && player.level == this) {
                player.addScore(3);
            }
        }
        if (this.mobs.length < 10 && Math.random() < 0.1) {
            this.spawnMob();
        }
    }

    spawnMob() {
    }
}

class Mob {
}