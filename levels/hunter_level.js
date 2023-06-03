import Util from '../shared/util.js';

import BlockLevel from './block_level.js';

export default class HunterLevel extends BlockLevel {
    get name() { return 'There Can Be Only One'; }
    get spawnTargetPos() { return [this.width / 2, this.height / 2]; }
    get exitPos() { return this.spawnTargetPos; }
    get killScore() { return 200; }

    isProtected(currentPlayer, pos) {
        return this.hasGrownupProtection(currentPlayer, pos);
    }

    isWorthPoints(currentPlayer, pos) {
        if (this.cell(pos).hasMob) return this.killMobScore;
        return super.isWorthPoints(currentPlayer, pos);
    }

    doLevelAction() {
        super.doLevelAction();
        this.givePoints();
        this.spawnMob();
        for (let mob of this.mobs) {
            if (mob) mob.doMobAction();
        }
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
    constructor(level, id) {
        this.level = level;
        this.id = id;
        this.pos = this.findSpawnPos();
        this.dir = Util.randomInt(0, 3);
        this.textHandle = Util.generateAutomatonHandle();
        this.level.cell(this.pos).setMob(this);
    }

    findSpawnPos() {
        let pos;
        while (!pos || !this.level.cell(pos).canEnter) {
            let x = Util.randomInt(1, this.level.width - 2);
            let y = Util.randomInt(1, this.level.height - 2);
            pos = [x, y];
        }
        return pos;
    }

    doMobAction() {
        let dest = this.level.movePos(this.pos, this.dir);
        if (this.level.cell(dest).hasPlayer) this.moveForward();
        else if (!this.level.cell(dest).canEnter) this.turnRight();
        else if (Math.random() < 0.9) this.moveForward();
        else if (Math.random() < 0.5) this.turnLeft();
        else this.turnRight();
    }

    moveForward() {
        let dest = this.level.movePos(this.pos, this.dir);
        if (this.level.cell(dest).canEnter) {
            this.level.cell(this.pos).clearMob();
            this.level.cell(dest).setMob(this);
            this.pos = dest;
        } else if (this.level.cell(dest).hasPlayer) {
            let other = this.level.server.game.players[this.level.cell(dest).playerId];
            this.level.server.game.respawn(other);
            other.log.write(`You were bumped off by ${this.textHandle}!`);
        }
    }

    turnLeft() { this.dir = (this.dir + 1) % 4; }
    turnRight() { this.dir = (this.dir + 3) % 4; }

    getState() {
        return {
            dir: this.dir,
            textHandle: this.textHandle,
        }
    }
}
