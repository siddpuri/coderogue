import Util from '../shared/util.js';
import Handles from '../shared/handles.js';

import Level from './level.js';

type Pos = [number, number];

export default class Mob {
    readonly textHandle = Handles.generateAutomatonHandle();
    pos: Pos;
    dir = Util.randomInt(0, 3);

    constructor(
        readonly level: Level,
        readonly id: number
    ) {
        this.pos = this.findSpawnPos();
        this.level.map.setMobId(this.pos, id);
    }

    findSpawnPos() {
        let pos: [number, number] | null = null;
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
            shouldEvade ||= this.isPlayerInDirFacingMe(dir);
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

    moveTowards(pos: Pos) {
        if (this.isGoodDirection(pos, 0)) this.moveForward();
        else if (this.isGoodDirection(pos, 1)) this.turnRight();
        else if (this.isGoodDirection(pos, 3)) this.turnLeft();
        else if (this.isGoodDirection(pos, 2)) this.turnRight();
        else this.moveRandomly();
    }

    isGoodDirection(pos: Pos, dir: number) {
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

    canMove(dir: number) {
        let realDir = (this.dir + dir) % 4;
        let dest = this.level.movePos(this.pos, realDir);
        return this.level.map.canEnter(dest);
    }

    isPlayerInDir(dir: number) {
        let realDir = (this.dir + dir) % 4;
        let dest = this.level.movePos(this.pos, realDir);
        return this.level.map.hasPlayer(dest);
    }

    isPlayerInDirFacingMe(dir: number) {
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
