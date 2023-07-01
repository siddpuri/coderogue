import util from 'util';
import { VM, VMScript } from 'vm2';

import Handles from '#cr/handles.js';

import JailLevel from '../levels/jail_level.js';
import IntroLevel from '../levels/intro_level.js';
import BlockLevel from '../levels/block_level.js';
import CaveLevel from '../levels/cave_level.js';
import HunterLevel from '../levels/hunter_level.js';

import Preamble from './preamble.js';
import VmEnvironment from './vm_environment.js';
import Player from './player.js';

const jailtimes = [10, 60, 600, 3600];
const chartUpdateInterval = 5 * 60 * 1000; // 5 minutes

export default class Game {
    constructor(server) {
        this.server = server;
        this.levels = [
            new JailLevel(server),
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
        if (player.idle > this.levels[player.levelNumber].maxIdleTime) {
            player.log.write('Idle timeout!');
            this.punish(player);
            player.idle = 0;
        }
    }

    punish(player) {
        player.offenses++;
        const maxJailtime = jailtimes[Math.min(player.offenses, jailtimes.length) - 1];
        player.jailtime = Math.floor(Math.random() * maxJailtime);
        this.moveToLevel(player, 0);
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
        player.dontScore = false;
        this.moveToLevel(player, 1);
    }

    respawnAt(player, level, pos, dir) {
        player.dontScore = true;
        this.moveToLevel(level.levelNumber);
    }

    exitPlayer(player) {
        player.incrementTimesCompleted();
        let newLevelNumber = player.levelNumber + 1;
        if (newLevelNumber == this.levels.length || player.dontScore) {
            newLevelNumber = 1;
        }
        this.moveToLevel(player, newLevelNumber);
    }

    moveToLevel(player, levelNumber) {
        this.levels[player.levelNumber].removePlayer(player);
        this.levels[levelNumber].spawn(player);
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
        this.players[player.id] = player;
        this.playerHandles.add(player.handle);
        this.levels[1].spawn(player);
    }

    createNewHandle() {
        const maxHandle = Handles.getMaxHandle();
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
