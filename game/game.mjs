import Players from './players.mjs';
import IntroLevel from './levels/intro.mjs';

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