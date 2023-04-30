import { VM } from 'vm2';

import VmEnvironment from './vm_environment.js';

import IntroLevel from '../levels/intro.js';

export default class Game {
  constructor(server) {
    this.server = server;
    this.levels = [
      new IntroLevel(),
    ];
    this.sandbox = new VmEnvironment(this);
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
      await this.movePlayer(player);
    }
    for (let level of this.levels) {
      await level.doPostTickActions();
    }
  }

  async movePlayer(player) {
    const vm = new VM({
      timeout: 1000,
      sandbox: this.sandbox,
      eval: false,
      wasm: false,
      allowAsync: false,
    })
    // const code = await this.server.repositories.readPlayerCode(player);
    // const code = 'this.x = randomNumber(1, 10); console.log(this.x);';
    const code = 'console.log(x); x = this.randomNumber(1, 10); console.log(x);';
    console.log('x = ' + this.sandbox.x);
    console.log('Running ' + code);
    vm.run(code);
    console.log('x = ' + this.sandbox.x);
    console.log('Done');
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