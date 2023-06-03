import BlockLevel from './block_level.js';

export default class HunterLevel extends BlockLevel {
    constructor(server) {
        super(server);
        this.mobs = [];
    }

    get name() { return 'There Can Be Only One'; }
    get spawnTargetPos() { return [this.width / 2, this.height / 2]; }
    get exitPos() { return this.spawnTargetPos; }
    get killScore() { return 200; }

    isProtected(currentPlayer, pos) {
        return this.hasGrownupProtection(currentPlayer, pos);
    }

    doLevelAction() {
        super.doLevelAction();
        this.givePoints();
        this.spawnMob();
    }

    givePoints() {
        for (let player of this.server.game.players) {
            if (player && player.level == this) {
                player.addScore(3);
            }
        }
    }

    spawnMob() {
        if (Math.random() >= 0.1) return;
        for (let i = 0; i < 10; i++) {
            if (!this.mobs[i]) {
                this.mobs[i] = new Mob(this, i);
                break;
            }
        }
    }
}

class Mob {
    constructor(level, mobId) {
        this.level = level;
        this.mobId = mobId;
    }
}
