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

    get isExit() {
        return this.type == 'o';
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

    setPlayer(player, dir) {
        this.playerId = player.id;
        this.dir = dir;
    }

    clearPlayer() {
        delete this.playerId;
        delete this.dir;
    }
}
