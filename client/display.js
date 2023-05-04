import constants from '../shared/constants.js';

const backgroundColor = '#f0f0f0';
const foregroundColor = '#101010';
const font = '10pt Courier New';
const characterWidth = 8;
const characterHeight = 10;

export default class Display {
    constructor() {
        this.canvas = document.getElementById('canvas');
        this.canvas.width = characterWidth * constants.levelWidth;
        this.canvas.height = characterHeight * constants.levelHeight;
        this.ctx = this.canvas.getContext('2d');
        this.clearCanvas();
        this.ctx.font = font;
    }

    showLoadingScreen() {
        const loadingText = 'Loading ...';
        const row = 15;
        const col = (constants.levelWidth - loadingText.length) / 2;
        this.clearCanvas();       
        this.setText(row, col, loadingText);
    }

    clearCanvas() {
        this.ctx.fillStyle = backgroundColor;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.fillStyle = foregroundColor;
    }

    setText(row, col, c) {
        row = (row + 1) * characterHeight;
        col *= characterWidth;
        this.ctx.fillText(c, col, row);
    }
}