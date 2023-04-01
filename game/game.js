import IntroLevel from '../levels/intro.js';

export class Game {
  constructor() {
    this.levels = [
      new IntroLevel(),
    ];
  }

  start() {
  }
}