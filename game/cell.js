// Note that the methods are only available on the server.
// The client receives a JSON blob containing cells as raw objects.

export default class Cell {
    get canEnter() {
        return (
            this.type != '#' &&
            !this.hasPlayer &&
            !this.hasMob
        );
    }

    get canSpawn() { return this.canEnter && !this.isExit; }
    get hasPlayer() { return Object.hasOwn(this, 'playerId'); }
    get hasMob() { return Object.hasOwn(this, 'mobId'); }
    get isExit() { return this.type == 'o'; }

    setWall() { this.type = '#'; }
    clearWall() { if (this.type == '#') delete this.type; }
    setSpawn() { this.type = '.'; }
    setExit() { this.type = 'o'; }

    setPlayer(player) { this.playerId = player.id; }
    clearPlayer() { delete this.playerId; }
    setMob(mob) { this.mobId = mob.id; }
    clearMob() { delete this.mobId; }
}
