import constants from './constants.js';

const backgroundColor = '#f0f0f0';
const foregroundColor = '#101010';
const highlightColor = '#ffff00';
const currentPlayerColor = '#ff0000';
const font = '10pt sans-serif';
const characterWidth = 8;
const characterHeight = 10;

const alertLevels = [
    'alert-success',
    'alert-secondary',
    'alert-warning',
    'alert-danger',
];

const numPlayersToRender = 12;

export default class Display {
    constructor(client) {
        this.client = client;
        this.canvas = document.getElementById('canvas');
        this.canvas.width = characterWidth * constants.levelWidth;
        this.canvas.height = characterHeight * constants.levelHeight;
        this.ctx = this.canvas.getContext('2d');
        this.clearCanvas();
        this.ctx.font = font;
        this.levelToRender = 0;
        this.players = [];
        this.messageNumber = 0;
        this.freezeLog = false;
        this.messagesToShow = 'all';
    }

    async start() {
        const loadingText = 'Loading ...';
        const row = 15;
        const col = (constants.levelWidth - loadingText.length) / 2;
        this.clearCanvas();       
        this.setText(row, col, loadingText);
        this.createPlayerRows();
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
        if (this.highlightedPlayer) {
            let playerLevel = this.players[this.highlightedPlayer].level;
            if (playerLevel != 'jail') this.levelToRender = playerLevel;
        }
        this.renderTitle();
        this.renderMap();
        this.renderPlayers();
    }

    renderTitle() {
        let span = document.getElementById('level');
        span.removeChild(span.firstChild);
        span.appendChild(document.createTextNode(this.levelToRender));
        span = document.getElementById('level-name');
        span.removeChild(span.firstChild);
        span.appendChild(document.createTextNode(this.levels[this.levelToRender].name));
    }

    renderMap() {
        this.map = this.levels[this.levelToRender].map;
        this.clearCanvas();
        for (let row = 0; row < this.map.length; row++) {
            for (let col = 0; col < this.map[row].length; col++) {
                let cell = this.map[row][col];
                let char = cell.type;
                let highlighted = false;
                let currentPlayer = false;
                if (Object.hasOwn(cell, 'playerId')) {
                    let dir = this.players[cell.playerId].dir;
                    char = '^>v<'[dir];
                    highlighted = cell.playerId == this.highlightedPlayer;
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

    createPlayerRows() {
        this.table = document.getElementById('players');
        for (let i = 0; i < numPlayersToRender; i++) {
            let row = this.table.insertRow();
            for (let j = 0; j < 3; j++) {
                row.insertCell();
            }
            row.onclick = () => this.highlightPlayer(i);
        }
    }

    renderPlayers() {
        this.players = this.findPlayersToRender();
        for (let i = 0; i < numPlayersToRender; i++) {
            let row = this.table.rows[i + 1];
            if (i < this.players.length) {
                row.classList.remove('hidden');
                let player = this.players[i];
                row.cells[0].innerHTML = player.score;
                row.cells[1].innerHTML = player.level;
                row.cells[2].innerHTML = player.handle;
                if (player.id == this.highlightedPlayer) {
                    row.classList.add('highlighted');
                } else {
                    row.classList.remove('highlighted');
                }
            } else {
                row.classList.add('hidden');
            }
        }
    }

    findPlayersToRender() {
        let result = [];
        if (this.client.credentials.playerId) {
            result.push(this.players[this.client.credentials.playerId]);
        }
        if (this.highlightedPlayer && this.highlightedPlayer != this.client.credentials.playerId) {
            result.push(this.players[this.highlightedPlayer]);
        }
        let topPlayers = this.players.slice();
        topPlayers.sort((a, b) => b.score - a.score);
        for (let player of topPlayers) {
            if (!player) continue;
            if (result.some(p => p.id == player.id)) continue;
            result.push(player);
            if (result.length >= numPlayersToRender) break;
        }
        result.sort((a, b) => b.score - a.score);
        return result;
    }

    highlightPlayer(index) {
        let playerId = this.players[index].id;
        if (playerId == this.highlightedPlayer) {
            this.highlightedPlayer = undefined;
        } else {
            this.highlightedPlayer = playerId;
        }
        for (let i = 0; i < this.players.length; i++) {
            let row = this.table.rows[i + 1];
            if (this.players[i].id == playerId) {
                row.classList.add('highlighted');
            } else {
                row.classList.remove('highlighted');
            }
        }
    }

    highlightTile(x, y) {
        if (!this.map) return;
        let row = Math.floor(y / characterHeight);
        let col = Math.floor(x / characterWidth);
        if (!this.map[row] || !this.map[row][col]) return;
        let playerId = this.map[row][col].playerId;
        if (!playerId) return;
        if (playerId == this.highlightedPlayer) {
            delete this.highlightedPlayer;
        } else {
            this.highlightedPlayer = playerId;
        }
    }

    setCode(code) {
        const codeArea = document.getElementById('code-text');
        codeArea.value = code;
    }

    getCode() {
        return document.getElementById('code-text').value;
    }

    setCodeCursor(cursor) {
        document.getElementById('code-text').selectionStart = cursor;
        document.getElementById('code-text').selectionEnd = cursor;
    }

    getCodeCursor() {
        return document.getElementById('code-text').selectionStart;
    }

    setLog(log) {
        const logArea = document.getElementById('log-text');
        logArea.value = this.filterLog(log);
    }

    toggleFreeze() {
        let button = document.getElementById('freeze').classList.toggle('active');
        this.freezeLog = !this.freezeLog;
    }

    showAll() {
        document.getElementById('show-all').classList.add('active');
        document.getElementById('show-latest').classList.remove('active');
        document.getElementById('show-filtered').classList.remove('active');
        this.messagesToShow = 'all';
    }

    showLatest() {
        document.getElementById('show-all').classList.remove('active');
        document.getElementById('show-latest').classList.add('active');
        document.getElementById('show-filtered').classList.remove('active');
        this.messagesToShow = 'latest';
    }

    showFiltered() {
        document.getElementById('show-all').classList.remove('active');
        document.getElementById('show-latest').classList.remove('active');
        document.getElementById('show-filtered').classList.add('active');
        this.messagesToShow = 'filtered';
    }

    filterLog(log) {
        let lines = log.split('\n');
        let filter = '';
        if (this.messagesToShow == 'latest' && lines.length > 0) {
            filter = lines[lines.length - 1].slice(0, 8);
        }
        if (this.messagesToShow == 'filtered') {
            filter = document.getElementById('filter-text').value;
        }
        lines = lines.filter(line => line.includes(filter));
        lines.reverse();
        return lines.join('\n');
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

    switchTab(dir) {
        let navLinks = document.getElementsByClassName('nav-link');
        let activeIndex = 0;
        for (let i = 0; i < navLinks.length; i++) {
            if (navLinks[i].classList.contains('active')) {
                activeIndex = i;
            }
        }
        navLinks[activeIndex].classList.remove('active');
        let newIndex = (activeIndex + dir + navLinks.length) % navLinks.length;
        navLinks[newIndex].click();
    }

    say(message, level) {
        const n = ++this.messageNumber;
        const div = document.getElementById('message');
        div.innerHTML = message;
        for (let level of alertLevels) {
            div.classList.remove(level);
        }
        div.classList.add(alertLevels[level]);
        div.classList.add('show');
        setTimeout(() => {
            if (this.messageNumber != n) return;
            div.classList.remove('show');
        }, 3000);
    }

    lookup(handle) {
        return this.players.find(p => p && p.handle == handle);
    }
}
