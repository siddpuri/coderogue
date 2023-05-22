import constants from './constants.js';

const backgroundColor = '#f0f0f0';
const foregroundColor = '#000000';
const wallColor = '#102060';
const highlightColor = '#4040ff';
const currentPlayerColor = '#ff4040';
const characterWidth = 8;
const characterHeight = 8;

const triangles = [
    [[0, characterHeight], [characterWidth, characterHeight], [characterWidth / 2, 0]],
    [[0, 0], [0, characterHeight], [characterWidth, characterHeight / 2]],
    [[0, 0], [characterWidth, 0], [characterWidth / 2, characterHeight]],
    [[characterWidth, 0], [characterWidth, characterHeight], [0, characterHeight / 2]]
];

export default class NewMap {
    constructor(client, id) {
        this.client = client;
        this.canvas = document.getElementById(id);
        this.ctx = this.canvas.getContext('2d');
    }

    async start() {
        this.clearCanvas();       
    }

    clearCanvas() {
        this.canvas.width = characterWidth * constants.levelWidth;
        this.canvas.height = characterHeight * constants.levelHeight;
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
                if (Object.hasOwn(cell, 'playerId')) {
                    this.renderPlayer(row, col, cell.playerId);
                }
                else if (char == '#') this.renderWall(row, col);
                else if (char == '.') this.renderSpawn(row, col);
                else if (char == 'o') this.renderExit(row, col);
            }
        }
    }

    renderPlayer(row, col, playerId) {
        let color = foregroundColor;
        if (playerId == this.client.display.highlightedPlayer) {
            color = highlightColor;
        }
        if (playerId == this.client.credentials.playerId) {
            color = currentPlayerColor;
        }
        let dir = this.players[playerId].dir;
        let triangle = triangles[dir];
        let x = col * characterWidth;
        let y = row * characterHeight;
        this.ctx.fillStyle = color;
        this.ctx.beginPath();
        this.ctx.moveTo(x + triangle[0][0], y + triangle[0][1]);
        this.ctx.lineTo(x + triangle[1][0], y + triangle[1][1]);
        this.ctx.lineTo(x + triangle[2][0], y + triangle[2][1]);
        this.ctx.fill();
    }

    renderWall(row, col) {
        let x = col * characterWidth;
        let y = row * characterHeight;
        this.ctx.fillStyle = wallColor;
        this.ctx.fillRect(x, y, characterWidth, characterHeight);
    }

    renderSpawn(row, col) {
        let x = (col + .5) * characterWidth;
        let y = (row + .5) * characterHeight;
        this.ctx.fillStyle = currentPlayerColor;
        this.ctx.beginPath();
        this.ctx.ellipse(x, y, 1, 1, 0, 0, 2 * Math.PI);
        this.ctx.fill();
    }

    renderExit(row, col) {
        let x = (col + .5) * characterWidth;
        let y = (row + .5) * characterHeight;
        this.ctx.strokeStyle = currentPlayerColor;
        this.ctx.beginPath();
        this.ctx.ellipse(x, y, 5, 5, 0, 0, 2 * Math.PI);
        this.ctx.stroke();
    }

    getPlayerAt(x, y) {
        if (!this.map) return;
        let row = Math.floor(y / characterHeight);
        let col = Math.floor(x / characterWidth);
        if (!this.map[row] || !this.map[row][col]) return;
        return this.map[row][col].playerId;
    }
}