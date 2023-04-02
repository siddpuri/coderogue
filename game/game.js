import IntroLevel from '../levels/intro.js';

export default class Game {
  constructor() {
    this.levels = [
      new IntroLevel(),
    ];
  }

  start() {
  }
}