const backgroundColor = '#f0f0f0';
const foregroundColor = '#101010';
const font = '10pt Courier New';
const characterWidth = 8;
const characterHeight = 10;
const levelWidth = 80;
const levelHeight = 40;
const loadingText = 'Loading ...';

export default class Display {
    constructor() {
        this.canvas = document.getElementById("canvas");
        this.canvas.width = characterWidth * levelWidth;
        this.canvas.height = characterHeight * levelHeight;
        this.ctx = this.canvas.getContext("2d");
        this.ctx.font = font;
        this.cursor = 0;
    }

    showLoadingScreen() {
        this.clearCanvas();       
        this.ctx.fillStyle = foregroundColor;
        const row = 15;
        const col = (levelWidth - loadingText.length) / 2;
        this.setText(row, col, loadingText);
    }

    clearCanvas() {
        this.ctx.fillStyle = backgroundColor;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }

    print(text) {
        this.ctx.fillStyle = foregroundColor;
        this.setText(this.cursor++, 0, text);
    }

    setText(row, col, c) {
        this.ctx.fillText(c, col * characterWidth, (row + 1) * characterHeight);
    }
}