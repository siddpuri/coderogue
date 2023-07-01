import Util from '../shared/util.js';
import Grownups from '#cr/grownups.js';
import LevelMap from '#cr/level_map.js';

const levelWidth = 80;
const levelHeight = 40;

export default class Level {
    constructor(server) {
        this.server = server;
        this.map = new LevelMap();
        this.mobs = [];
        this.drawMap();
    }
    
    get name() { return 'Mystery Level'; }
    get width() { return levelWidth; }
    get height() { return levelHeight; }
    get spawnTargetPos() { return [10, 10]; }
    get exitPos() { return [this.width - 10, this.height - 10]; }
    get exitScore() { return 100; }
    get killScore() { return 100; }
    get killMobScore() { return 100; }
    get bumpScore() { return 0; }
    get maxIdleTime() { return 60; }

    isProtected(currentPlayer, pos) { return true; }

    isWorthPoints(currentPlayer, pos) {
        let playerId = this.map.getPlayerId(pos);
        if (playerId == null) return 0;
        if (playerId == currentPlayer) return 0;
        if (this.isProtected(currentPlayer, pos)) return 0;
        if (this.server.game.players[playerId].dontScore) return 0;
        return this.killScore;
    }

    hasGrownupProtection(currentPlayer, pos) {
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

    spawn(player) {
        let dir = Util.randomInt(0, 3);
        this.spawnAround(player, this.spawnTargetPos, dir, 10);
    }

    spawnAt(player, pos, dir) {
        this.spawnAround(player, pos, dir, 0);
    }

    spawnAround(player, pos, dir, radius) {
        for (let r = radius; true; r++) {
            let [dx, dy] = [r, r];
            while (dx * dx + dy * dy > r * r) {
                dx = Util.randomInt(-r, r);
                dy = Util.randomInt(-r, r);
            }
            let candidate = [pos[0] + dx, pos[1] + dy];
            let [x, y] = candidate;
            if (x < 0 || x >= this.width) continue;
            if (y < 0 || y >= this.height) continue;
            if (this.map.canSpawn(candidate)) {
                this.addPlayer(player, candidate, dir);
                return;
            }
        }
    }

    addPlayer(player, pos, dir) {
        player.levelNumber = this.levelNumber;
        player.pos = pos;
        player.dir = dir;
        this.map.setPlayerId(pos, player.id);
    }

    removePlayer(player) {
        this.map.clearPlayer(player.pos);
    }

    moveForward(player) {
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
            if (player.score > 0) player.addScore(this.bumpScore);
        }
    }

    movePlayer(player, dest) {
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

    bumpPlayer(player, dest) {
        let otherId = this.map.getPlayerId(dest);
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

    bumpMob(player, dest) {
        if (player.dontScore) {
            player.log.write(`Can't bump automata after respawnAt.`);
            return;
        }
        let mobId = this.map.getMobId(dest);
        let mob = this.mobs[mobId];
        player.addScore(this.killMobScore);
        this.map.clearMob(dest);
        delete this.mobs[mobId];
        player.log.write(`You just bumped off ${mob.textHandle}!`);
    }

    turnRight(player) { player.dir = (player.dir + 1) % 4; }
    turnLeft(player) { player.dir = (player.dir + 3) % 4; }

    canMove(player, dir) {
        let realDir = (player.dir + dir) % 4;
        let newPos = this.movePos(player.pos, realDir);
        return this.map.canEnter(newPos);
    }

    movePos(pos, dir) {
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
