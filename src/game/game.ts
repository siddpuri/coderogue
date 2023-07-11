import util from 'util';
import { VM, VMScript } from 'vm2';

import Handles from '../shared/handles.js';
import { StateResponse, PlayerData } from '../shared/protocol.js';
import Timer from '../shared/timer.js';

import Server from '../server/server.js';
import { PlayerEntry } from '../server/db.js';

import JailLevel from '../levels/jail_level.js';
import IntroLevel from '../levels/intro_level.js';
import BlockLevel from '../levels/block_level.js';
import CaveLevel from '../levels/cave_level.js';
import HunterLevel from '../levels/hunter_level.js';

import Level from './level.js';
import Player from './player.js';
import VmEnvironment from './vm_environment.js';

type Pos = [number, number];

const jailtimes = [10, 60, 600, 3600];
const chartUpdateInterval = 5 * 60 * 1000; // 5 minutes

export default class Game {
    readonly levels: Level[];
    players: Player[] = [];
    private playerHandles: Set<number> = new Set();
    private lastChartUpdate = Date.now();
    private busy = false;
    private timer = new Timer();

    constructor(
        private readonly server: Server
    ) {
        this.levels = [
            JailLevel,
            IntroLevel,
            BlockLevel,
            CaveLevel,
            HunterLevel,
        ].map((levelClass, i) => new levelClass(server, i));
    }

    async start(): Promise<void> {
        await this.loadPlayers();
        this.busy = false;
        setInterval(() => this.tick(), 1000);
    }

    private async loadPlayers(): Promise<void> {
        for (let dbEntry of await this.server.db.loadPlayers()) {
            this.addPlayer(dbEntry);
        }
    }

    createNewHandle(): number {
        let maxHandle = Handles.getMaxHandle();
        if (this.playerHandles.size >= maxHandle) {
            console.log('Max handles exceeded!');
            return 0;
        }
        let handle = 0;
        for (let done = false; !done;) {
            let handle = Math.floor(Math.random() * maxHandle);
            done = !this.playerHandles.has(handle);
        }
        return handle;
    }

    addPlayer(dbEntry: PlayerEntry): void {
        let player = new Player(dbEntry);
        this.players[player.id] = player;
        this.playerHandles.add(dbEntry.handle);
        this.levels[1].spawn(player);
    }

    private async tick(): Promise<void> {
        if (this.busy) {
            console.log('Missed a tick.');
            return;
        }
        this.timer.start();
        this.busy = true;
        await this.doTickActions();
        this.busy = false;
        this.timer.stop();
        this.timer.log();
    }

    private async doTickActions(): Promise<void> {
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

    private async doPlayerAction(player: Player): Promise<void> {
        if (player.isInJail) this.updateJailTime(player);
        if (player.isInJail) return;
        await this.ensureAction(player);
        if (player.isInJail) return;
        this.takeAction(player);
        if (player.isInJail) return;
        this.updateIdleTime(player);
    }

    private updateJailTime(player: Player): void {
        if (player.jailtime == 0) {
            this.respawn(player);
            return;
        }
        player.jailtime--;
        player.incrementTimeSpent();
        player.log.write(`In jail for ${player.jailtime} more turns.`);
    }

    private async ensureAction(player: Player): Promise<void> {
        if (player.action) return;
        try {
            player.action = await this.createPlayerAction(player);
        } catch (e) {
            player.log.write('Failed to compile script!');
            player.log.write(this.trimError(e));
            this.punish(player);
        }
    }

    private async createPlayerAction(player: Player): Promise<() => void> {
        let env = new VmEnvironment(this, player);
        let vm = new VM({
            timeout: 200,
            sandbox: env.sandbox,
            eval: false,
            wasm: false,
            allowAsync: false,
        });
        let code = await this.server.playerCode.readCode(player.id);
        let script = new VMScript(this.server.playerCode.preamble + code);
        return () => vm.run(script);
    }

    private takeAction(player: Player): void {
        player.incrementTimeSpent();
        player.idle++;
        player.turns = 1;
        try {
            let action = player.action as (() => void);
            action();
        } catch (e) {
            if ((e as { code: string }).code == 'ERR_SCRIPT_EXECUTION_TIMEOUT') {
                player.log.write('Script execution timed out!');
            } else {
                player.log.write(this.trimError(e));
            }
            this.punish(player);
        }
    }

    private trimError(e: unknown): string {
        let lines = util.inspect(e).split('\n');
        let i = lines.findIndex(l =>
            l.includes('at Script.runInContext') ||
            l.includes('at VMScript._compile')
        );
        if (i > 0) lines = lines.slice(0, i);
        lines.reverse();
        return lines.join('\n');
    }

    private punish(player: Player): void {
        player.offenses++;
        let maxJailtime = jailtimes[Math.min(player.offenses, jailtimes.length) - 1];
        player.jailtime = Math.floor(Math.random() * maxJailtime);
        this.moveToLevel(player, 0);
    }

    private updateIdleTime(player: Player): void {
        if (player.idle == 0) player.offenses = 0;
        if (player.idle > this.levels[player.levelNumber].maxIdleTime) {
            player.log.write('Idle timeout!');
            this.punish(player);
            player.idle = 0;
        }
    }

    respawn(player: Player): void {
        player.dontScore = false;
        this.moveToLevel(player, 1);
    }

    respawnAt(player: Player, level: Level, pos: Pos, dir: number): void {
        player.dontScore = true;
        this.levels[player.levelNumber].removePlayer(player);
        this.levels[level.levelNumber].spawnAt(player, pos, dir);
    }

    exitPlayer(player: Player): void {
        player.incrementTimesCompleted();
        let newLevelNumber = player.levelNumber + 1;
        if (newLevelNumber == this.levels.length || player.dontScore) {
            newLevelNumber = 1;
        }
        this.moveToLevel(player, newLevelNumber);
    }

    moveToLevel(player: Player, levelNumber: number): void {
        this.levels[player.levelNumber].removePlayer(player);
        this.levels[levelNumber].spawn(player);
    }

    getState(): StateResponse {
        return {
            players: this.players.map(player => player? player.getState() as PlayerData : undefined),
            levels: this.levels.map(level => level.getState()),
        };
    }
}
