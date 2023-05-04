import { VM, VMScript } from 'vm2';

import VmEnvironment from './vm_environment.js';

import Util from '../shared/util.js';
import Player from '../server/player.js';
import IntroLevel from '../levels/intro.js';

export default class Game {
  constructor(server) {
    this.server = server;
    this.levels = [
      new IntroLevel(),
    ];
    this.playersById = new Array(Util.getMaxHandle());
    this.playersByHandle = {};
    this.playerActions = [];
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
      if (player) await this.doPlayerAction(player);
    }
    for (let level of this.levels) {
      await level.doPostTickActions();
    }
  }

  async doPlayerAction(player) {
    try {
      (await this.ensurePlayerAction(player))();
    } catch(e) {
      console.log(e);
    }
  }

  async ensurePlayerAction(player) {
    let action = this.playerActions[player.id];
    if (!action) {
      const vm = new VM({
        timeout: 1000,
        sandbox: new VmEnvironment(this, player),
        eval: false,
        wasm: false,
        allowAsync: false,
      });
      const code = await this.server.repositories.readPlayerCode(player);
      const script = new VMScript(code);
      action = () => vm.run(script);
      this.playerActions[player.id] = action;
    }
    return action;
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
    const maxHandle = Util.getMaxHandle();
    if (this.playersById.length >= maxHandle) {
        console.log('Max handles exceeded!');
        return false;
    }
    let handle;
    while (!handle || this.playersByHandle[handle]) {
        handle = Math.floor(Math.random() * maxHandle);
    }
    return handle;
  }
}