import Util from '../shared/util.js';
import Grownups from '../shared/grownups.js';
import LevelMap from '../shared/level_map.js';
import { LevelData } from '../shared/protocol.js';

import Server from '../server/server.js';

import Player from './player.js';
import Mob from './mob.js';

type Pos = [number, number];

const levelWidth = 80;
const levelHeight = 40;

export default abstract class Level {
    readonly map = new LevelMap();
    mobs: Mob[] = [];
    mobTarget: Player | null = null;

    constructor(
        readonly server: Server,
        readonly levelNumber: number
    ) {
        this.drawMap();
    }
    
    get name() { return 'Mystery Level'; }
    get width() { return levelWidth; }
    get height() { return levelHeight; }
    get spawnTargetPos(): Pos { return [10, 10]; }
    get exitPos(): Pos { return [this.width - 10, this.height - 10]; }
    get exitScore() { return 100; }
    get killScore() { return 100; }
    get killMobScore() { return 100; }
    get bumpScore() { return 0; }
    get maxIdleTime() { return 60; }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    isProtected(currentPlayer: Player, pos: Pos): boolean { return true; }

    isWorthPoints(currentPlayer: Player, pos: Pos): number {
        let playerId = this.map.getPlayerId(pos);
        if (playerId == null) return 0;
        if (playerId == currentPlayer.id) return 0;
        if (this.isProtected(currentPlayer, pos)) return 0;
        if (this.server.game.players[playerId].dontScore) return 0;
        return this.killScore;
    }

    hasGrownupProtection(currentPlayer: Player, pos: Pos): boolean {
        if (!Grownups.includes(currentPlayer.id)) return false;
        let playerId = this.map.getPlayerId(pos);
        if (playerId == null) return false;
        if (Grownups.includes(playerId)) return false;
        return true;
    }

    doLevelAction(): void { /* virtual */ }

    private drawMap(): void {
        for (let x = 0; x < this.width; x++) {
            this.map.setWall([x, 0]);
            this.map.setWall([x, this.height - 1]);
        }
        for (let y = 0; y < this.height; y++) {
            this.map.setWall([0, y]);
            this.map.setWall([this.width - 1, y]);
        }
        this.map.setExit(this.exitPos);
        this.map.setSpawn(this.spawnTargetPos);
    }

    spawn(player: Player): void {
        let dir = Util.randomInt(0, 3);
        this.spawnAround(player, this.spawnTargetPos, dir, 10);
    }

    spawnAt(player: Player, pos: Pos, dir: number): void {
        this.spawnAround(player, pos, dir, 0);
    }

    private spawnAround(player: Player, pos: Pos, dir: number, radius: number): void {
        let r = radius;
        let p: Pos = [0, 0];
        for (let done = false; !done;) {
            let dx = Util.randomInt(-r, r);
            let dy = Util.randomInt(-r, r);
            if (dx * dx + dy * dy > r * r) continue;
            p = [pos[0] + dx, pos[1] + dy];
            if (p[0] < 0 || p[0] >= this.width) continue;
            if (p[1] < 0 || p[1] >= this.height) continue;
            done = this.map.canSpawn(p);
            r++;
        }
        this.addPlayer(player, p, dir);
    }

    private addPlayer(player: Player, pos: Pos, dir: number): void {
        player.levelNumber = this.levelNumber;
        player.pos = pos;
        player.dir = dir;
        this.map.setPlayerId(pos, player.id);
    }

    removePlayer(player: Player): void {
        this.map.clearPlayer(player.pos);
    }

    moveForward(player: Player): void {
        let dest = this.movePos(player.pos, player.dir);
        if (this.map.canEnter(dest)) {
            this.movePlayer(player, dest);
        }
        else if (this.map.hasPlayer(dest)) {
            this.bumpPlayer(player, dest);
        }
        else if (this.map.hasMob(dest)) {
            this.bumpMob(player, dest);
        }
        else {
            player.log.write('Bump!');
            if (player.totalScore > 0) player.addScore(this.bumpScore);
        }
    }

    movePlayer(player: Player, dest: Pos): void {
        this.map.clearPlayer(player.pos);
        player.pos = dest;
        this.map.setPlayerId(player.pos, player.id);
        if (this.map.hasExit(player.pos)) {
            // TODO: update for level numbering
            player.log.write(`Completed level ${this.levelNumber - 1}!`);
            player.addScore(this.exitScore);
            this.server.game.exitPlayer(player);
        }
        player.idle = 0;
    }

    bumpPlayer(player: Player, dest: Pos): void {
        let otherId = this.map.getPlayerId(dest) as number;
        let other = this.server.game.players[otherId];
        if (player.dontScore) {
            player.log.write('Can\'t bump players after respawnAt.');
            return;
        }
        if (this.isProtected(player, dest)) {
            player.log.write(`Player ${other.textHandle} is protected.`);
            return;
        }
        if (!other.dontScore) {
            player.addScore(this.killScore);
            player.incrementKills();
            other.incrementDeaths();
        }
        this.server.game.respawn(other);
        player.log.write(`You just bumped off ${other.textHandle}!`);
        other.log.write(`You were bumped off by ${player.textHandle}!`);
        player.idle = 0;
    }

    bumpMob(player: Player, dest: Pos): void {
        if (player.dontScore) {
            player.log.write('Can\'t bump automata after respawnAt.');
            return;
        }
        let mobId = this.map.getMobId(dest) as number;
        let mob = this.mobs[mobId];
        player.addScore(this.killMobScore);
        this.map.clearMob(dest);
        delete this.mobs[mobId];
        player.log.write(`You just bumped off ${mob.textHandle}!`);
    }

    turnRight(player: Player): void { player.dir = (player.dir + 1) % 4; }
    turnLeft(player: Player): void { player.dir = (player.dir + 3) % 4; }

    canMove(player: Player, dir: number): boolean {
        let realDir = (player.dir + dir) % 4;
        let newPos = this.movePos(player.pos, realDir);
        return this.map.canEnter(newPos);
    }

    movePos(pos: Pos, dir: number): Pos {
        const offsets = [[ 0, -1], [ 1,  0], [ 0,  1], [-1,  0]];
        let offset = offsets[dir];
        return [pos[0] + offset[0], pos[1] + offset[1]];
    }

    getState(): LevelData {
        return {
            name: this.name,
            map: this.map.serialize(),
            mobs: this.mobs.map(m => m.getState()),
        };
    }
}
