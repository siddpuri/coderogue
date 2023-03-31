export default class Players {
    constructor() {
        this.players = [];
    }
    
    add(player) {
        this.players.push(player);
    }
    
    remove(player) {
        this.players.splice(this.players.indexOf(player), 1);
    }
    
    getPlayers() {
        return this.players;
    }
}