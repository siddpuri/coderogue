import { VM, VMScript } from 'vm2';

import Util from '../shared/util.js';
import IntroLevel from '../levels/intro_level.js';
import BlockLevel from '../levels/block_level.js';

import Player from './player.js';
import VmEnvironment from './vm_environment.js';

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
      player.action = await this.createPlayerAction(player);
    }
    player.grantTurn();
    try {
      await player.action();
    } catch(e) {
      player.log.write(e);
    }
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

  async writeScores() {
    // TODO
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
