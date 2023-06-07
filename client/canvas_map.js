import constants from './constants.js';

const triangles = [
    [[1, 8], [7, 8], [4, 0]],
    [[0, 1], [0, 7], [8, 4]],
    [[1, 0], [7, 0], [4, 8]],
    [[8, 1], [8, 7], [0, 4]]
];

export default class CanvasMap {
    constructor(client, id) {
        this.client = client;
        this.canvas = document.getElementById(id);
        this.ctx = this.canvas.getContext('2d');
        this.style = 0;
    }

    get backgroundColor()    { return '#f0f0f0'; }
    get foregroundColor()    { return ['#101010', '#000000'][this.style]; }
    get wallColor()          { return ['#101010', '#8080a0'][this.style];}
    get highlightColor()     { return ['#ffff00', '#4040ff'][this.style]; }
    get currentPlayerColor() { return ['#ff0000', '#ff4040'][this.style]; }
    get mobColor()           { return ['#00c000', '#00a000'][this.style]; }
    get font()               { return '10pt sans-serif'; }
    get dx()                 { return 8; }
    get dy()                 { return [10, 8][this.style]; }

    async start() {
        this.clearCanvas();       
    }

    setStyle(style) {
        this.style = style;
        this.render(this.level, this.players);
    }

    clearCanvas() {
        this.canvas.width = this.dx * constants.levelWidth;
        this.canvas.height = this.dy * constants.levelHeight;
        this.ctx.font = this.font;
        this.ctx.fillStyle = this.backgroundColor;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.fillStyle = this.foregroundColor;
    }

    render(level, players) {
        this.level = level;
        this.players = players;
        this.clearCanvas();
        let map = level.map;
        for (let row = 0; row < map.length; row++) {
            for (let col = 0; col < map[row].length; col++) {
                let cell = map[row][col];
                if (Object.hasOwn(cell, 'playerId')) {
                    this.renderPlayer(row, col, cell.playerId);
                }
                if (Object.hasOwn(cell, 'mobId')) {
                    this.renderMob(row, col, cell.mobId);
                }
                switch (cell.type) {
                    case '#': this.renderWall(row, col); break;
                    case '.': this.renderSpawn(row, col); break;
                    case 'o': this.renderExit(row, col); break;
                }
            }
        }
    }

    renderPlayer(row, col, playerId) {
        let color = this.foregroundColor;
        if (playerId == this.client.display.highlightedPlayer) {
            color = this.highlightColor;
        }
        if (playerId == this.client.credentials.playerId) {
            color = this.currentPlayerColor;
        }
        let dir = this.players[playerId].dir;
        this.renderArrow(row, col, dir, color);
    }

    renderMob(row, col, mobId) {
        let dir = this.level.mobs[mobId].dir;
        this.renderArrow(row, col, dir, this.mobColor);
    }

    renderArrow(row, col, dir, color) {
        switch (this.style) {
        case 0:
            this.setText(row, col, '^>v<'[dir], color);
            break;
        case 1:
            let triangle = triangles[dir];
            let x = col * this.dx;
            let y = row * this.dy;
            this.ctx.fillStyle = color;
            this.ctx.beginPath();
            this.ctx.moveTo(x + triangle[0][0], y + triangle[0][1]);
            this.ctx.lineTo(x + triangle[1][0], y + triangle[1][1]);
            this.ctx.lineTo(x + triangle[2][0], y + triangle[2][1]);
            this.ctx.fill();
            break;
        }
    }

    renderWall(row, col) {
        switch (this.style) {
        case 0:
            this.setText(row, col, '#');
            break;
        case 1:
            let x = col * this.dx;
            let y = row * this.dy;
            this.ctx.fillStyle = this.wallColor;
            this.ctx.fillRect(x, y, this.dx, this.dy);
            break;
        }
    }

    renderSpawn(row, col) {
        switch (this.style) {
        case 0:
            this.setText(row, col, '.');
            break;
        case 1:
            let x = (col + .5) * this.dx;
            let y = (row + .5) * this.dy;
            this.ctx.fillStyle = this.currentPlayerColor;
            this.ctx.beginPath();
            this.ctx.ellipse(x, y, 1, 1, 0, 0, 2 * Math.PI);
            this.ctx.fill();
            break;
        }
    }

    renderExit(row, col) {
        switch (this.style) {
        case 0:
            this.setText(row, col, 'o');
            break;
        case 1:
            let x = (col + .5) * this.dx;
            let y = (row + .5) * this.dy;
            this.ctx.strokeStyle = this.currentPlayerColor;
            this.ctx.beginPath();
            this.ctx.ellipse(x, y, 5, 5, 0, 0, 2 * Math.PI);
            this.ctx.stroke();
            break;
        }
    }

    setText(row, col, char, color) {
        this.ctx.fillStyle = color?? this.foregroundColor;
        if (color == this.highlightColor) {
            this.ctx.fillRect(col * this.dx, row * this.dy, this.dx, this.dy);
            this.ctx.fillStyle = this.foregroundColor;
        }
        this.ctx.fillText(char, col * this.dx, (row + 1) * this.dy);
        this.ctx.fillStyle = this.foregroundColor;
    }

    getPlayerAt(mouseX, mouseY) {
        if (!this.level) return;
        let [x0, y0] = this.getPosAt(mouseX, mouseY);
        let closestPlayerId = null;
        let closestDistance = Infinity;
        for (let y = y0 - 1; y <= y0 + 1; y++) {
            for (let x = x0 - 1; x <= x0 + 1; x++) {
                let playerId = this.getPlayerAtPos([x, y]);
                if (playerId == null) continue;
                let player = this.players[playerId];
                let distance = this.getDistance(mouseX, mouseY, player.pos);
                if (distance < closestDistance) {
                    closestPlayerId = playerId;
                    closestDistance = distance;
                }
            }
        }
        return closestPlayerId;
    }

    getPosAt(mouseX, mouseY) {
        return [
            Math.floor(mouseX / this.dx),
            Math.floor(mouseY / this.dy)
        ];
    }

    getPlayerAtPos(pos) {
        if (!this.level.map[pos[1]] || !this.level.map[pos[1]][pos[0]]) return null;
        let cell = this.level.map[pos[1]][pos[0]];
        return Object.hasOwn(cell, 'playerId') ? cell.playerId : null;
    }

    getDistance(mouseX, mouseY, playerPos) {
        return Math.sqrt(
            Math.pow(mouseX - playerPos[0] * this.dx, 2) +
            Math.pow(mouseY - playerPos[1] * this.dy, 2)
        );
    }
}
