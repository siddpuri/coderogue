import Util from '../shared/util.js';
import Grownups from '../shared/grownups.js';
import LevelMap from '../shared/level_map.js';

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

    isProtected(currentPlayer: Player, pos: Pos) { return true; }

    isWorthPoints(currentPlayer: Player, pos: Pos) {
        let playerId = this.map.getPlayerId(pos);
        if (playerId == null) return 0;
        if (playerId == currentPlayer.id) return 0;
        if (this.isProtected(currentPlayer, pos)) return 0;
        if (this.server.game.players[playerId].dontScore) return 0;
        return this.killScore;
    }

    hasGrownupProtection(currentPlayer: Player, pos: Pos) {
        if (!Grownups.list.includes(currentPlayer.id)) return false;
        let playerId = this.map.getPlayerId(pos);
        if (playerId == null) return false;
        if (Grownups.list.includes(playerId)) return false;
        return true;
    }

    doLevelAction() {}

    drawMap() {
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

    spawn(player: Player) {
        let dir = Util.randomInt(0, 3);
        this.spawnAround(player, this.spawnTargetPos, dir, 10);
    }

    spawnAt(player: Player, pos: Pos, dir: number) {
        this.spawnAround(player, pos, dir, 0);
    }

    spawnAround(player: Player, pos: Pos, dir: number, radius: number) {
        for (let r = radius; true; r++) {
            let [dx, dy] = [r, r];
            while (dx * dx + dy * dy > r * r) {
                dx = Util.randomInt(-r, r);
                dy = Util.randomInt(-r, r);
            }
            let candidate: Pos = [pos[0] + dx, pos[1] + dy];
            let [x, y] = candidate;
            if (x < 0 || x >= this.width) continue;
            if (y < 0 || y >= this.height) continue;
            if (this.map.canSpawn(candidate)) {
                this.addPlayer(player, candidate, dir);
                return;
            }
        }
    }

    addPlayer(player: Player, pos: Pos, dir: number) {
        player.levelNumber = this.levelNumber;
        player.pos = pos;
        player.dir = dir;
        this.map.setPlayerId(pos, player.id);
    }

    removePlayer(player: Player) {
        this.map.clearPlayer(player.pos);
    }

    moveForward(player: Player) {
        let dest = this.movePos(player.pos, player.dir)
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
            player.log.write(`Bump!`);
            if (player.totalScore > 0) player.addScore(this.bumpScore);
        }
    }

    movePlayer(player: Player, dest: Pos) {
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

    bumpPlayer(player: Player, dest: Pos) {
        let otherId = this.map.getPlayerId(dest) as number;
        console.assert(otherId, 'No player at dest');
        let other = this.server.game.players[otherId];
        if (player.dontScore) {
            player.log.write(`Can't bump players after respawnAt.`);
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

    bumpMob(player: Player, dest: Pos) {
        if (player.dontScore) {
            player.log.write(`Can't bump automata after respawnAt.`);
            return;
        }
        let mobId = this.map.getMobId(dest) as number;
        console.assert(mobId, 'No mob at dest');
        let mob = this.mobs[mobId];
        player.addScore(this.killMobScore);
        this.map.clearMob(dest);
        delete this.mobs[mobId];
        player.log.write(`You just bumped off ${mob.textHandle}!`);
    }

    turnRight(player: Player) { player.dir = (player.dir + 1) % 4; }
    turnLeft(player: Player) { player.dir = (player.dir + 3) % 4; }

    canMove(player: Player, dir: number) {
        let realDir = (player.dir + dir) % 4;
        let newPos = this.movePos(player.pos, realDir);
        return this.map.canEnter(newPos);
    }

    movePos(pos: Pos, dir: number): Pos {
        const offsets = [[ 0, -1], [ 1,  0], [ 0,  1], [-1,  0]];
        let offset = offsets[dir];
        return [pos[0] + offset[0], pos[1] + offset[1]];
    }

    getState() {
        return {
            name: this.name,
            map: this.map.serialize(),
            mobs: this.mobs.map(m => m.getState()),
        };
    }
}
