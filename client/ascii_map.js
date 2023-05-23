import constants from './constants.js';

const backgroundColor = '#f0f0f0';
const foregroundColor = '#101010';
const highlightColor = '#ffff00';
const currentPlayerColor = '#ff0000';
const font = '10pt sans-serif';
const characterWidth = 8;
const characterHeight = 10;

export default class AsciiMap {
    constructor(client, id) {
        this.client = client;
        this.canvas = document.getElementById(id);
        this.ctx = this.canvas.getContext('2d');
    }

    async start() {
        const loadingText = 'Loading ...';
        const row = 15;
        const col = (constants.levelWidth - loadingText.length) / 2;
        this.clearCanvas();       
        this.setText(row, col, loadingText);
    }

    clearCanvas() {
        this.canvas.width = characterWidth * constants.levelWidth;
        this.canvas.height = characterHeight * constants.levelHeight;
        this.ctx.font = font;
        this.ctx.fillStyle = backgroundColor;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.fillStyle = foregroundColor;
    }

    render(map, players) {
        this.map = map;
        this.players = players;
        this.clearCanvas();
        for (let row = 0; row < map.length; row++) {
            for (let col = 0; col < map[row].length; col++) {
                let cell = map[row][col];
                let char = cell.type;
                let highlighted = false;
                let currentPlayer = false;
                if (Object.hasOwn(cell, 'playerId')) {
                    let dir = players[cell.playerId].dir;
                    char = '^>v<'[dir];
                    highlighted = cell.playerId == this.client.display.highlightedPlayer;
                    currentPlayer = cell.playerId == this.client.credentials.playerId;
                }
                if (char) this.setText(row, col, char, highlighted, currentPlayer);
            }
        }
    }

    setText(row, col, text, highlighted, currentPlayer) {
        row = (row + 1) * characterHeight;
        col *= characterWidth;
        if (highlighted) {
            this.ctx.fillStyle = highlightColor;
            this.ctx.fillRect(col, row - characterHeight, characterWidth, characterHeight);
            this.ctx.fillStyle = foregroundColor;
        }
        if (currentPlayer) {
            this.ctx.fillStyle = currentPlayerColor;
        }
        this.ctx.fillText(text, col, row);
        this.ctx.fillStyle = foregroundColor;
    }

    getPlayerAt(x, y) {
        if (!this.map) return;
        let [col, row] = this.getPosAt(x, y);
        if (!this.map[row] || !this.map[row][col]) return;
        return this.map[row][col].playerId;
    }

    getPosAt(x, y) {
        let row = Math.floor(y / characterHeight);
        let col = Math.floor(x / characterWidth);
        return [col, row];
    }
}