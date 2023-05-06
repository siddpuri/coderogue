import constants from './constants.js';

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

    setText(row, col, text) {
        row = (row + 1) * characterHeight;
        col *= characterWidth;
        this.ctx.fillText(text, col, row);
    }

    showMap(map) {
        this.clearCanvas();
        for (let row = 0; row < map.length; row++) {
            for (let col = 0; col < map[row].length; col++) {
                const cell = map[row][col];
                if (!cell) {
                    console.log(row, col);
                    continue;
                }
                if (cell.isWall) {
                    this.setText(row, col, "#");
                } else if (cell.mob) {
                    this.setText(row, col, "@");
                }
            }
        }
    }
}
