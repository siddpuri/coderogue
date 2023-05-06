export default class Cell {
    constructor() {
    }

    get isFree() {
        return this.type != '#' && !Object.hasOwn(this, 'playerId');
    }

    setWall() {
        this.type = '#';
    }

    setSpawn() {
        this.type = '.';
    }

    setExit() {
        this.type = 'o';
    }

    setPlayerId(playerId, dir) {
        this.playerId = playerId;
        this.dir = dir;
    }

    clearPlayer() {
        delete this.playerId;
        delete this.dir;
    }
}
