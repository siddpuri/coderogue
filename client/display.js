import constants from './constants.js';

const backgroundColor = '#f0f0f0';
const foregroundColor = '#101010';
const highlightColor = '#ffff00';
const font = '10pt Courier New';
const characterWidth = 8;
const characterHeight = 10;

const alertLevels = [
    'alert-success',
    'alert-info',
    'alert-warning',
    'alert-danger',
];

export default class Display {
    constructor(client) {
        this.client = client;
        this.canvas = document.getElementById('canvas');
        this.canvas.width = characterWidth * constants.levelWidth;
        this.canvas.height = characterHeight * constants.levelHeight;
        this.ctx = this.canvas.getContext('2d');
        this.clearCanvas();
        this.ctx.font = font;
        this.messageNumber = 0;
    }

    start() {
        const loadingText = 'Loading ...';
        const row = 15;
        const col = (constants.levelWidth - loadingText.length) / 2;
        this.clearCanvas();       
        this.setText(row, col, loadingText);
    }

    isShowingLogTab() {
        const logTab = document.getElementById('log-tab');
        return logTab.classList.contains('active');
    }

    clearCanvas() {
        this.ctx.fillStyle = backgroundColor;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.fillStyle = foregroundColor;
    }

    render(state) {
        this.players = [];
        for (let player of state.players) {
            if (player) this.players[player.id] = player;
        }
        this.levels = state.levels;
        this.renderMap(this.levels[0]);
        this.renderPlayers();
    }

    renderMap(map) {
        this.clearCanvas();
        for (let row = 0; row < map.length; row++) {
            for (let col = 0; col < map[row].length; col++) {
                let cell = map[row][col];
                let char = cell.type;
                let highlighted = false;
                if (Object.hasOwn(cell, 'playerId')) {
                    const dir = this.players[cell.playerId].dir;
                    char = '^>v<'[dir];
                    highlighted = cell.playerId == this.highlightedPlayer;
                }
                if (char) this.setText(row, col, char, highlighted);
            }
        }
    }

    setText(row, col, text, highlighted) {
        row = (row + 1) * characterHeight;
        col *= characterWidth;
        if (highlighted) {
            this.ctx.fillStyle = highlightColor;
            this.ctx.fillRect(col, row - characterHeight, characterWidth, characterHeight);
            this.ctx.fillStyle = foregroundColor;
        }
        this.ctx.fillText(text, col, row);
    }

    renderPlayers() {
        const info = [];
        for (let player of this.players) {
            if (!player) continue;
            info.push([player.score, player.period, player.handle, player.id]);
        }
        info.sort((a, b) => b[0] - a[0]);
        const table = document.getElementById('players');
        while(table.rows.length > 1) {
            table.deleteRow(1);
        }
        for (let entry of info) {
            const row = table.insertRow();
            for (let i = 0; i < 3; i++) {
                const cell = row.insertCell();
                cell.innerHTML = entry[i];
            }
            if (entry[3] == this.highlightedPlayer) {
                row.classList.add('highlighted');
                this.highlightedRow = row;
            }
            row.onclick = () => this.highlightPlayer(row, entry[3]);
        }
    }

    highlightPlayer(row, playerId) {
        if (Object.hasOwn(this, 'highlightedRow')) {
            this.highlightedRow.classList.remove('highlighted');
            let oldHighlightedRow = this.highlightedRow;
            delete this.highlightedRow;
            delete this.highlightedPlayer;
            if (row == oldHighlightedRow) return;
        }
        this.highlightedRow = row;
        this.highlightedPlayer = playerId;
        row.classList.add('highlighted');
    }

    setCode(code) {
        const codeArea = document.getElementById('code-text');
        codeArea.value = code;
    }

    getCode() {
        return document.getElementById('code-text').value;
    }

    setLog(log) {
        const logArea = document.getElementById('log-text');
        logArea.value = log;
    }

    showLoggedIn() {
        document.getElementById('login-form').classList.add('d-none');
        document.getElementById('logout-form').classList.remove('d-none');
        document.getElementById('handle').innerHTML = this.client.credentials.handle;
    }

    showLoggedOut() {
        document.getElementById('login-form').classList.remove('d-none');
        document.getElementById('logout-form').classList.add('d-none');
    }

    say(message, level) {
        const n = ++this.messageNumber;
        const div = document.getElementById('message');
        div.innerHTML = message;
        div.classList.add(alertLevels[level]);
        div.classList.add('show');
        setTimeout(() => {
            if (this.messageNumber != n) return;
            div.classList.remove('show');
        }, 3000);
    }
}
