import constants from './constants.js';

const backgroundColor = '#f0f0f0';
const foregroundColor = '#101010';
const highlightColor = '#ffff00';
const currentPlayerColor = '#ff0000';
const mobColor = '#00c000';
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

    render(level, players) {
        this.level = level;
        this.players = players;
        this.clearCanvas();
        let map = level.map;
        for (let row = 0; row < map.length; row++) {
            for (let col = 0; col < map[row].length; col++) {
                let cell = map[row][col];
                let char = cell.type;
                let isHighlighted = false;
                let isCurrentPlayer = false;
                let isMob = false;
                if (Object.hasOwn(cell, 'playerId')) {
                    let dir = players[cell.playerId].dir;
                    char = '^>v<'[dir];
                    isHighlighted = cell.playerId == this.client.display.highlightedPlayer;
                    isCurrentPlayer = cell.playerId == this.client.credentials.playerId;
                }
                if (Object.hasOwn(cell, 'mobId')) {
                    let dir = level.mobs[cell.mobId].dir;
                    char = '^>v<'[dir];
                    isMob = true;
                }
                if (char) this.setText(row, col, char, isHighlighted, isCurrentPlayer, isMob);
            }
        }
    }

    setText(row, col, text, isHighlighted, isCurrentPlayer, isMob) {
        row = (row + 1) * characterHeight;
        col *= characterWidth;
        if (isHighlighted) {
            this.ctx.fillStyle = highlightColor;
            this.ctx.fillRect(col, row - characterHeight, characterWidth, characterHeight);
            this.ctx.fillStyle = foregroundColor;
        }
        if (isCurrentPlayer) {
            this.ctx.fillStyle = currentPlayerColor;
        }
        if (isMob) {
            this.ctx.fillStyle = mobColor;
        }
        this.ctx.fillText(text, col, row);
        this.ctx.fillStyle = foregroundColor;
    }

    getPlayerAt(x, y) {
        if (!this.level) return;
        let map = this.level.map;
        let [col, row] = this.getPosAt(x, y);
        if (!map[row] || !map[row][col]) return;
        return map[row][col].playerId;
    }

    getPosAt(x, y) {
        let row = Math.floor(y / characterHeight);
        let col = Math.floor(x / characterWidth);
        return [col, row];
    }
}