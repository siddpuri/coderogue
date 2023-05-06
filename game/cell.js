export default class Cell {
    constructor() {
        this.isWall = false;
        this.objects = [];
        this.mob = null;
    }

    get isFree() {
        return !this.isWall && !this.mob;
    }
}
