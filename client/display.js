import AsciiMap from './ascii_map.js';
import NewMap from './new_map.js';

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
        this.asciiMap = new AsciiMap(client, 'canvas');
        this.newMap = new NewMap(client, 'canvas');
        this.map = this.asciiMap;
        this.levelToRender = 0;
        this.renderedPlayers = [];
        this.messageNumber = 0;
        this.freezeLog = false;
        this.messagesToShow = 'all';
    }

    async start() {
        await this.asciiMap.start();
        await this.newMap.start();
        this.createPlayerRows();
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

    render(state) {
        let players = [];
        for (let player of state.players) {
            if (player) players[player.id] = player;
        }
        if (this.highlightedPlayer) {
            let playerLevel = players[this.highlightedPlayer].level;
            if (playerLevel != 'jail') this.levelToRender = playerLevel;
        }
        let level = state.levels[this.levelToRender];
        this.renderTitle(level.name);
        this.map.render(level.map, players);
        this.renderPlayers(players);
    }

    renderTitle(name) {
        let span = document.getElementById('level');
        span.removeChild(span.firstChild);
        span.appendChild(document.createTextNode(this.levelToRender));
        span = document.getElementById('level-name');
        span.removeChild(span.firstChild);
        span.appendChild(document.createTextNode(name));
    }

    renderPlayers(players) {
        this.renderedPlayers = this.findPlayersToRender(players);
        for (let i = 0; i < numPlayersToRender; i++) {
            let row = this.table.rows[i + 1];
            if (i < this.renderedPlayers.length) {
                row.classList.remove('hidden');
                let player = this.renderedPlayers[i];
                row.cells[0].innerHTML = player.score;
                row.cells[1].innerHTML = player.level;
                row.cells[2].innerHTML = player.handle;
            } else {
                row.classList.add('hidden');
            }
        }
        this.renderPlayerHighlight();
    }

    findPlayersToRender(players) {
        let result = [];
        if (this.client.credentials.playerId) {
            result.push(players[this.client.credentials.playerId]);
        }
        if (this.highlightedPlayer && this.highlightedPlayer != this.client.credentials.playerId) {
            result.push(players[this.highlightedPlayer]);
        }
        let topPlayers = players.slice();
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
        this.toggleHighlight(this.renderedPlayers[index].id);
    }

    highlightTile(x, y) {
        this.toggleHighlight(this.map.getPlayerAt(x, y));
    }

    toggleHighlight(playerId) {
        if (!playerId) return;
        if (playerId == this.highlightedPlayer) {
            delete this.highlightedPlayer;
        } else {
            this.highlightedPlayer = playerId;
        }
        this.renderPlayerHighlight();
    }

    renderPlayerHighlight() {
        for (let i = 0; i < this.renderedPlayers.length; i++) {
            let row = this.table.rows[i + 1];
            if (this.renderedPlayers[i].id == this.highlightedPlayer) {
                row.classList.add('highlighted');
            } else {
                row.classList.remove('highlighted');
            }
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

    isShowingLogTab() {
        const logTab = document.getElementById('log-tab');
        return logTab.classList.contains('active');
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
        return this.renderedPlayers.find(p => p && p.handle == handle);
    }
}
