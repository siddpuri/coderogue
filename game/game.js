import IntroLevel from '../levels/intro.js';

export default class Game {
  constructor(server) {
    this.server = server;
    this.levels = [
      new IntroLevel(),
    ];
  }

  async start() {
    await this.readScores();
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