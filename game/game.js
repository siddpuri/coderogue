import { VM } from 'vm2';

import VmEnvironment from './vm_environment.js';

import IntroLevel from '../levels/intro.js';

export default class Game {
  constructor(server) {
    this.server = server;
    this.levels = [
      new IntroLevel(),
    ];
    this.environments = [];
  }

  async start() {
    await this.readScores();
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
    for (let player of this.server.db.players) {
      await this.takePlayerTurn(player);
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

  async readScores() {
    this.scores = [];
    for (let p of this.server.db.players) {
      this.scores[p.id] = 0;
    }
    for (let s of await this.server.db.readScores()) {
      this.scores[s.player] = s.score;
    }
  }

  async writeScores() {
    await this.server.db.writeScores(this.scores);
  }
}