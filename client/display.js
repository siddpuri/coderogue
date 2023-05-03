import constants from './constants.js';

export default class Display {
    constructor() {
        this.canvas = document.getElementById('canvas');
        this.canvas.width = constants.characterWidth * constants.levelWidth;
        this.canvas.height = constants.characterHeight * constants.levelHeight;
        this.ctx = this.canvas.getContext('2d');
        this.clearCanvas();
        this.ctx.font = constants.font;
    }

    showLoadingScreen() {
        const loadingText = 'Loading ...';
        const row = 15;
        const col = (constants.levelWidth - loadingText.length) / 2;
        this.clearCanvas();       
        this.setText(row, col, loadingText);
    }

    clearCanvas() {
        this.ctx.fillStyle = constants.backgroundColor;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.fillStyle = constants.foregroundColor;
    }

    setText(row, col, c) {
        row = (row + 1) * constants.characterHeight;
        col *= constants.characterWidth;
        this.ctx.fillText(c, col, row);
    }
}