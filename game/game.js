import { VM, VMScript } from 'vm2';

import PlayerInfo from './player_info.js';
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
    this.playerInfos = [];
    this.playerHandles = new Set();
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
    for (let playerInfo of this.playerInfos) {
      if (playerInfo) await this.doPlayerAction(playerInfo);
    }
    for (let level of this.levels) {
      await level.doPostTickActions();
    }
  }

  async doPlayerAction(playerInfo) {
    if (!playerInfo.action) {
      playerInfo.action = await this.createPlayerAction(playerInfo.player);
    }
    try {
      await playerInfo.action();
    } catch(e) {
      console.log(e);
    }
  }

  async createPlayerAction(player) {
    const env = new VmEnvironment(this, player.id);
    const vm = new VM({
      timeout: 1000,
      sandbox: env.sandbox,
      eval: false,
      wasm: false,
      allowAsync: false,
    });
    const code = await this.server.repositories.readPlayerCode(player);
    const script = new VMScript(code);
    return () => vm.run(script);
  }

  async loadState() {
    for (let dbEntry of await this.server.db.loadPlayers()) {
      const player = new Player(dbEntry);
      const playerInfo = new PlayerInfo(player);
      this.playerInfos[player.id] = playerInfo;
      this.playerHandles.add(player.handle);
      this.levels[0].addPlayer(player.id);
      playerInfo.level = 0;
    }
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

  moveForward(playerId) {
    const level = this.playerInfos[playerId].level;
    return this.levels[level].moveForward(playerId);
  }

  turnRight(playerId) {
    const level = this.playerInfos[playerId].level;
    return this.levels[level].turnRight(playerId);
  }

  turnLeft(playerId) {
    const level = this.playerInfos[playerId].level;
    return this.levels[level].turnLeft(playerId);
  }

  canMove(playerId, dir) {
    const level = this.playerInfos[playerId].level;
    return this.levels[level].canMove(playerId, dir);
  }

  log(playerId, text) {
    const log = this.playerInfos[playerId].log;
    log.write(text);
  }
}
