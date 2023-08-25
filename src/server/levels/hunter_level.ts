import Util from '../../shared/util.js';

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

    isProtected(currentPlayer: Player, pos: Pos): boolean {
        return this.hasGrownupProtection(currentPlayer, pos);
    }

    isWorthPoints(currentPlayer: Player, pos: Pos): number {
        if (this.map.hasMob(pos)) return this.killMobScore;
        return super.isWorthPoints(currentPlayer, pos);
    }

    doLevelAction(): void {
        super.doLevelAction();
        this.givePoints();
        if (Math.random() < 0.1) this.spawnMob();
        this.decideMobTarget();
        for (let mob of this.mobs) {
            if (mob) mob.doMobAction();
        }
    }

    private givePoints(): void {
        for (let player of this.server.game.players) {
            if (this.isOnLevel(player)) player.addScore(3);
        }
    }

    private spawnMob(): void {
        for (let i = 0; i < numMobs; i++) {
            if (!this.mobs[i]) {
                this.mobs[i] = new Mob(this, i);
                break;
            }
        }
    }

    private decideMobTarget(): void {
        let players = this.server.game.players.filter(this.isOnLevel.bind(this));
        if (this.mobTarget && !players.includes(this.mobTarget)) {
            this.mobTarget = null;
        }
        if (players.length > 0 && Math.random() < 0.1) {
            this.mobTarget = Util.randomElement(players);
        }
    }

    private isOnLevel(player: Player): boolean {
        return player && player.levelNumber == this.levelNumber;
    }
}
