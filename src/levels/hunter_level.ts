import Util from '../shared/util.js';

import Server from '../server/server.js';

import Player from '../game/player.js';
import Mob from '../game/mob.js';

import BlockLevel from './block_level.js';

type Pos = [number, number];

const numMobs = 10;

export default class HunterLevel extends BlockLevel {
    constructor(server: Server, levelNumber: number) {
        super(server, levelNumber);
        this.map.clearExit(this.exitPos);
    }

    get name() { return 'There can be only one'; }
    get spawnTargetPos() { return [this.width / 2, this.height / 2] as Pos; }
    get exitPos() { return this.spawnTargetPos; }
    get killScore() { return 200; }

    isProtected(currentPlayer: Player, pos: Pos) {
        return this.hasGrownupProtection(currentPlayer, pos);
    }

    isWorthPoints(currentPlayer: Player, pos: Pos) {
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
            if (this.isOnLevel(player)) player.addScore(3);
        }
    }

    spawnMob() {
        for (let i = 0; i < numMobs; i++) {
            if (!this.mobs[i]) {
                this.mobs[i] = new Mob(this, i);
                break;
            }
        }
    }

    decideMobTarget() {
        let players = this.server.game.players.filter(this.isOnLevel.bind(this));
        if (this.mobTarget && !players.includes(this.mobTarget)) {
            this.mobTarget = null;
        }
        if (players.length > 0 && Math.random() < 0.1) {
            this.mobTarget = Util.randomElement(players);
        }
    }

    isOnLevel(player: Player) {
        return player && player.levelNumber == this.levelNumber;
    }
}
