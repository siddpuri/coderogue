import { VM, VMScript } from 'vm2';
import util from 'util';

import Util from '../shared/util.js';
import IntroLevel from '../levels/intro_level.js';
import BlockLevel from '../levels/block_level.js';

import Player from './player.js';
import VmEnvironment from './vm_environment.js';

const maxIdleTime = 60;

export default class Game {
  constructor(server) {
    this.server = server;
    this.levels = [
      new IntroLevel(server),
      new BlockLevel(server),
    ];
    for (let i = 0; i < this.levels.length; i++) {
      this.levels[i].levelNumber = i;
    }
    this.players = [];
    this.playerHandles = new Set();
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
    for (let player of this.players) {
      if (player) await this.doPlayerAction(player);
    }
    for (let level of this.levels) {
      await level.doLevelAction();
    }
  }

  async doPlayerAction(player) {
    if (!player.action) {
      try {
        player.action = await this.createPlayerAction(player);
      } catch (e) {
        player.log.write('Failed to compile script!');
        player.log.write(this.trimError(e));
      }
    }
    if (player.idle++ > maxIdleTime) this.killPlayer(player);
    if (player.jailtime) {
      player.log.write(`In jail for ${player.jailtime--} more turns.`);
      return;
    }
    player.turns = 1;
    try {
      await player.action();
      player.timeouts = 0;
    } catch (e) {
      if (e.code == 'ERR_SCRIPT_EXECUTION_TIMEOUT') {
        player.log.write('Script execution timed out!');
        if (player.timeouts < 3) player.timeouts++;
        player.jailtime = 10 ** player.timeouts;
      } else {
        player.log.write(this.trimError(e));
      }
    }
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
    this.removePlayer(player);
    player.log.write('You have been killed!');
    this.levels[0].spawn(player);
  }

  respawnAt(player, level, pos, dir) {
    this.removePlayer(player);
    this.levels[level].spawnAt(player, pos, dir);
    player.dontScore = true;
  }

  exitPlayer(player) {
    let n = player.level.levelNumber;
    if (!player.dontScore) this.levels[n].score(player);
    this.removePlayer(player);
    player.log.write(`Completed level ${n}!`);
    player.log.write(`Score is now: ${player.score}`);
    n = player.dontScore ? 0 : (n + 1) % this.levels.length;
    player.level = this.levels[n];
    this.levels[n].spawn(player);
    delete player.dontScore;
  }

  removePlayer(player) {
    this.levels[player.level.levelNumber].movePlayer(player, undefined);
    player.level = undefined;
  }

  getLevel(player) {
    return this.levels[player.level.levelNumber];
  }

  onNewCode(playerId) {
    const player = this.players[playerId];
    delete player.action;
    player.jailtime = 0;
    player.log.write('New code loaded.');
  }

  async createPlayerAction(player) {
    const env = new VmEnvironment(this, player);
    const vm = new VM({
      timeout: 100,
      sandbox: env.sandbox,
      eval: false,
      wasm: false,
      allowAsync: false,
    });
    const code = await this.server.repositories.readCode(player.id);
    const script = new VMScript(code);
    return () => vm.run(script);
  }

  async loadPlayers() {
    for (let dbEntry of await this.server.db.loadPlayers()) {
      this.addPlayer(dbEntry);
    }
  }

  addPlayer(dbEntry) {
    const player = new Player(dbEntry);
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
