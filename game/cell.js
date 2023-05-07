// Note that the methods are only available on the server.
// The client receives a JSON blob containing cells as raw objects.

export default class Cell {
    constructor() {
    }

    get canEnter() {
        return this.type != '#' && !this.hasPlayer;
    }

    get hasPlayer() {
        return Object.hasOwn(this, 'playerId');
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
