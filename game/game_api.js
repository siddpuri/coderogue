export default class GameApi {
    constructor(game, playerId) {
        this.game = game;
        this.playerId = playerId;
    }

    moveForward() {
        if (!this.game.useTurn(this.playerId)) return false;
        const level = this.game.playerInfos[this.playerId].level;
        return this.game.levels[level].moveForward(this.playerId);
    }

    turnRight() {
        if (!this.game.useTurn(this.playerId)) return false;
        const level = this.game.playerInfos[this.playerId].level;
        return this.game.levels[level].turnRight(this.playerId);
    }

    turnLeft() {
        if (!this.game.useTurn(this.playerId)) return false;
        const level = this.game.playerInfos[this.playerId].level;
        return this.game.levels[level].turnLeft(this.playerId);
    }

    canMove(dir) {
        const level = this.game.playerInfos[this.playerId].level;
        return this.game.levels[level].canMove(this.playerId, dir);
    }


}