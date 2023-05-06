import Level from '../game/level.js';

export default class IntroLevel extends Level {
    constructor() {
        super();
        for (let c = 0; c < this.width; c++) {
            this.map[0][c].isWall = true;
            this.map[this.height - 1][c].isWall = true;
        }
        for (let r = 0; r < this.height; r++) {
            this.map[r][0].isWall = true;
            this.map[r][this.width - 1].isWall = true;
        }
    }

    async doPostTickActions() {
        // console.log("Post tick");
    }
}
