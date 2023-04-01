import Players from './players.js';
import IntroLevel from './levels/intro.js';

export default class Game {
  constructor() {
    this.players = new Players();
    this.levels = [
      new IntroLevel(),
    ];
  }

  start() {
  }
}