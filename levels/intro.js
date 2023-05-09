import Util from '../shared/util.js';
import Level from '../game/level.js';

export default class IntroLevel extends Level {
    constructor(server) {
        super(server);
        for (let c = 0; c < this.width; c++) {
            this.map[0][c].setWall();
            this.map[this.height - 1][c].setWall();
        }
        for (let r = 0; r < this.height; r++) {
            this.map[r][0].setWall();
            this.map[r][this.width - 1].setWall();
        }
    }

    score(player) {
        player.score += 100;
    }

    async doPostTickActions() {
    }

    moveForward(player) {
        super.moveForward(player);
    }
}
