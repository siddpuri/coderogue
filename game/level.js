import Cell from './cell.js';

export default class Level {
    constructor(width, height) {
        this.width = width;
        this.height = height;
        this.map =
            Array(height).fill().map(() =>
                Array(width).fill().map(() =>
                    new Cell()));
    }
    
    get spawnPoint() { return [10, 10]; }
}