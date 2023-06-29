import util from 'util';
import { VM, VMScript } from 'vm2';

import Util from '../shared/util.js';
import Player from '../shared/player.js';

import IntroLevel from '../levels/intro_level.js';
import BlockLevel from '../levels/block_level.js';
import CaveLevel from '../levels/cave_level.js';
import HunterLevel from '../levels/hunter_level.js';

import Preamble from './preamble.js';
import VmEnvironment from './vm_environment.js';
import CircularLog from './circular_log.js';

const jailtimes = [10, 60, 600, 3600];
const chartUpdateInterval = 5 * 60 * 1000; // 5 minutes

export default class Game {
    constructor(server) {
        this.server = server;
        this.levels = [
            new IntroLevel(server),
            new BlockLevel(server),
            new CaveLevel(server),
            new HunterLevel(server),
        ];
        for (let i = 0; i < this.levels.length; i++) {
            this.levels[i].levelNumber = i;
        }
        this.players = [];
        this.playerHandles = new Set();
        this.lastChartUpdate = Date.now();
    }

    async start() {
        await this.loadPlayers();
        this.busy = false;
        this.timer = setInterval(() => this.tick(), 1000);
    }

    async tick() {
        if (this.busy) {
            console.log('Missed a tick.');
            return;
        }
        this.busy = true;
        await this.doTickActions();
        this.busy = false;
    }

    async doTickActions() {
        if (Date.now() - this.lastChartUpdate > chartUpdateInterval) {
            for (let player of this.players) {
                if (player) player.addChartInterval();
            }
            this.lastChartUpdate += chartUpdateInterval;
        }
        for (let player of this.players) {
            if (player) await this.doPlayerAction(player);
        }
        for (let level of this.levels) {
            level.doLevelAction();
        }
    }

    async doPlayerAction(player) {
        if (player.isInJail) this.updateJailTime(player);
        if (player.isInJail) return;
        await this.ensureAction(player);
        if (player.isInJail) return;
        await this.takeAction(player);
        if (player.isInJail) return;
        this.updateIdleTime(player);
    }

    updateJailTime(player) {
        if (--player.jailtime == 0) {
            this.respawn(player);
            return;
        }
        player.incrementTimeSpent();
        player.log.write(`In jail for ${player.jailtime} more turns.`);
    }

    async ensureAction(player) {
        if (player.action) return;
        try {
            player.action = await this.createPlayerAction(player);
        } catch (e) {
            player.log.write('Failed to compile script!');
            player.log.write(this.trimError(e));
            this.punish(player);
        }
    }

    async takeAction(player) {
        player.incrementTimeSpent();
        player.idle++;
        player.turns = 1;
        try {
            await player.action();
        } catch (e) {
            if (e.code == 'ERR_SCRIPT_EXECUTION_TIMEOUT') {
                player.log.write('Script execution timed out!');
            } else {
                player.log.write(this.trimError(e));
            }
            this.punish(player);
        }
    }

    updateIdleTime(player) {
        if (player.idle == 0) player.offenses = 0;
        if (player.idle > player.level.maxIdleTime) {
            player.log.write('Idle timeout!');
            this.punish(player);
            player.idle = 0;
        }
    }

    punish(player) {
        player.level.removePlayer(player);
        player.offenses++;
        const maxJailtime = jailtimes[Math.min(player.offenses, jailtimes.length) - 1];
        player.jailtime = Math.floor(Math.random() * maxJailtime);
    }

    trimError(e) {
        let lines = util.inspect(e).split('\n');
        let i = lines.findIndex(l =>
            l.includes('at Script.runInContext') ||
            l.includes('at VMScript._compile')
        );
        if (i > 0) lines = lines.slice(0, i);
        lines.reverse();
        return lines.join('\n');
    }

    killPlayer(player) {
        player.log.write('You have been killed!');
        this.respawn(player);
    }

    respawn(player) {
        if (player.level) player.level.removePlayer(player);
        this.levels[0].spawn(player);
        delete player.dontScore;
    }

    respawnAt(player, level, pos, dir) {
        player.level.removePlayer(player);
        level.spawnAt(player, pos, dir);
        player.dontScore = true;
    }

    exitPlayer(player) {
        player.incrementTimesCompleted();
        let levelNumber = player.levelNumber;
        player.level.removePlayer(player);
        levelNumber = (levelNumber + 1) % this.levels.length;
        if (player.dontScore) levelNumber = 0;
        this.levels[levelNumber].spawn(player);
        delete player.dontScore;
    }

    async createPlayerAction(player) {
        const env = new VmEnvironment(this, player);
        const vm = new VM({
            timeout: 200,
            sandbox: env.sandbox,
            eval: false,
            wasm: false,
            allowAsync: false,
        });
        const code = await this.server.repositories.readCode(player.id);
        const script = new VMScript(Preamble.code + code);
        return () => vm.run(script);
    }

    async loadPlayers() {
        for (let dbEntry of await this.server.db.loadPlayers()) {
            this.addPlayer(dbEntry);
        }
    }

    addPlayer(dbEntry) {
        let player = new Player(dbEntry);
        player.log = new CircularLog(1000);
        this.players[player.id] = player;
        this.playerHandles.add(player.handle);
        this.levels[0].spawn(player);
    }

    createNewHandle() {
        const maxHandle = Util.getMaxHandle();
        if (this.playerHandles.size >= maxHandle) {
            console.log('Max handles exceeded!');
            return false;
        }
        while (true) {
            let handle = Math.floor(Math.random() * maxHandle);
            if (!this.playerHandles.has(handle)) {
                return handle;
            }
        }
    }

    getState() {
        return {
            players: this.players.map(player => player ? player.getState() : null),
            levels: this.levels.map(level => level.getState()),
        };
    }
}
