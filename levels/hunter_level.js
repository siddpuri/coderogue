import Util from '../shared/util.js';

import BlockLevel from './block_level.js';

export default class HunterLevel extends BlockLevel {
    constructor(server) {
        super(server);
        this.mobTarget = null;
    }

    get name() { return 'There can be only one'; }
    get spawnTargetPos() { return [this.width / 2, this.height / 2]; }
    get exitPos() { return this.spawnTargetPos; }
    get killScore() { return 200; }

    isProtected(currentPlayer, pos) {
        return this.hasGrownupProtection(currentPlayer, pos);
    }

    isWorthPoints(currentPlayer, pos) {
        if (this.map.hasMob(pos)) return this.killMobScore;
        return super.isWorthPoints(currentPlayer, pos);
    }

    doLevelAction() {
        super.doLevelAction();
        this.givePoints();
        if (Math.random() < 0.1) this.spawnMob();
        this.decideMobTarget();
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
        for (let i = 0; i < 5; i++) {
            if (!this.mobs[i]) {
                this.mobs[i] = new Mob(this, i);
                break;
            }
        }
    }

    decideMobTarget() {
        let players = this.server.game.players.filter(p => p && p.level == this);
        if (!players.includes(this.mobTarget)) this.mobTarget = null;
        if (players.length > 0 && Math.random() < 0.1) {
            this.mobTarget = Util.randomElement(players);
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
        this.level.map.setMobId(this.pos, id);
    }

    findSpawnPos() {
        let pos;
        while (!pos || !this.level.map.canEnter(pos)) {
            let x = Util.randomInt(1, this.level.width - 2);
            let y = Util.randomInt(1, this.level.height - 2);
            pos = [x, y];
        }
        return pos;
    }

    doMobAction() {
        try {
            if (this.bumpPlayer()) return;
            if (this.evadePlayer()) return;
            if (this.facePlayer()) return;
            if (this.level.mobTarget && Math.random() < 0.5) {
                this.moveTowards(this.level.mobTarget.pos);
            }
            else this.moveRandomly();
        } catch (e) {
            console.log(e);
        }
    }

    bumpPlayer() {
        let canBump = this.isPlayerInDir(0);
        if (canBump) this.moveForward();
        return canBump;
    }

    evadePlayer() {
        if (!this.canMove(0)) return false;
        let shouldEvade = false;
        for (let dir = 1; dir < 4; dir++) {
            shouldEvade |= this.isPlayerInDirFacingMe(dir);
        }
        if (shouldEvade) this.moveForward();
        return shouldEvade;
    }

    facePlayer() {
        for (let dir = 1; dir < 4; dir++) {
            if (this.isPlayerInDir(dir)) {
                dir == 3? this.turnLeft() : this.turnRight();
                return true;
            }
        }
        return false;
    }

    moveTowards(pos) {
        if (this.isGoodDirection(pos, 0)) this.moveForward();
        else if (this.isGoodDirection(pos, 1)) this.turnRight();
        else if (this.isGoodDirection(pos, 3)) this.turnLeft();
        else if (this.isGoodDirection(pos, 2)) this.turnRight();
        else this.moveRandomly();
    }

    isGoodDirection(pos, dir) {
        if (!this.canMove(dir)) return false;
        let realDir = (this.dir + dir) % 4;
        return (
            realDir == 0 && pos[1] < this.pos[1] ||
            realDir == 1 && pos[0] > this.pos[0] ||
            realDir == 2 && pos[1] > this.pos[1] ||
            realDir == 3 && pos[0] < this.pos[0]
        );
    }

    moveRandomly() {
        if (this.canMove(0) && Math.random() < 0.9) this.moveForward();
        else if (Math.random() < 0.5) this.turnLeft();
        else this.turnRight();
    }

    moveForward() {
        let dest = this.level.movePos(this.pos, this.dir);
        if (this.level.map.canEnter(dest)) {
            this.level.map.clearMob(this.pos);
            this.level.map.setMobId(dest, this.id);
            this.pos = dest;
            return;
        }
        
        let playerId = this.level.map.getPlayerId(dest);
        if (playerId != null) {
            let other = this.level.server.game.players[playerId];
            this.level.server.game.respawn(other);
            other.log.write(`You were bumped off by ${this.textHandle}!`);
        }
    }

    turnLeft() { this.dir = (this.dir + 3) % 4; }
    turnRight() { this.dir = (this.dir + 1) % 4; }

    canMove(dir) {
        let realDir = (this.dir + dir) % 4;
        let dest = this.level.movePos(this.pos, realDir);
        return this.level.map.canEnter(dest);
    }

    isPlayerInDir(dir) {
        let realDir = (this.dir + dir) % 4;
        let dest = this.level.movePos(this.pos, realDir);
        return this.level.map.hasPlayer(dest);
    }

    isPlayerInDirFacingMe(dir) {
        let realDir = (this.dir + dir) % 4;
        let dest = this.level.movePos(this.pos, realDir);
        let playerId = this.level.map.getPlayerId(dest);
        if (playerId == null) return false;
        let other = this.level.server.game.players[playerId];
        return other.dir == (realDir + 2) % 4;
    }

    getState() {
        return {
            dir: this.dir,
            textHandle: this.textHandle,
        }
    }
}
