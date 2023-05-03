import { VM } from 'vm2';

import VmEnvironment from './vm_environment.js';

import constants from '../client/constants.js';
import Player from '../server/player.js';
import IntroLevel from '../levels/intro.js';

export default class Game {
  constructor(server) {
    this.server = server;
    this.levels = [
      new IntroLevel(),
    ];
    this.environments = [];
    this.playersById = new Array(constants.maxHandle);
    this.playersByHandle = {};
  }

  async start() {
    await this.loadState();
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
    for (let level of this.levels) {
      await level.doPreTickActions();
    }
    for (let player of this.playersById) {
      if (player) await this.takePlayerTurn(player);
    }
    for (let level of this.levels) {
      await level.doPostTickActions();
    }
  }

  async takePlayerTurn(player) {
    const vm = new VM({
      timeout: 1000,
      sandbox: this.ensureSandbox(player),
      eval: false,
      wasm: false,
      allowAsync: false,
    });
    const code = await this.server.repositories.readPlayerCode(player);
    try {
      vm.run(code);
    } catch(e) {
      console.log(e);
    }
  }

  ensureSandbox(player) {
    let env = this.environments[player.id];
    if (!env) {
      env = new VmEnvironment(this, player);
      this.environments[player.id] = env;
    }
    return env.sandbox;
  }

  async loadState() {
    for (let dbEntry of await this.server.db.loadPlayers()) {
      const p = new Player(dbEntry);
      this.playersById[p.id] = p;
      this.playersByHandle[p.handle] = p;
    }
  }

  async writeScores() {
    await this.server.db.writeScores(this.playersById);
  }

  createNewHandle() {
    if (this.playersById.length >= constants.maxHandle) {
        console.log('Max handles exceeded!');
        return false;
    }
    let handle;
    while (!handle || this.playersByHandle[handle]) {
        handle = Math.floor(Math.random() * constants.maxHandle);
    }
    return handle;
  }
}