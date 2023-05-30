import Util from './util.js';
import Player from './player.js';

import AsciiMap from './ascii_map.js';
import NewMap from './new_map.js';

const alertLevels = [
    'alert-success',
    'alert-secondary',
    'alert-warning',
    'alert-danger',
];

const numPlayersToRender = 10;

export default class Display {
    constructor(client) {
        this.client = client;
        this.asciiMap = new AsciiMap(client, 'canvas');
        this.newMap = new NewMap(client, 'canvas');
        this.map = this.asciiMap;
        this.levelToRender = 0;
        this.renderPlayersFrom = 0;
        this.numPlayers = 0;
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
        let playerTable = document.getElementById('players');
        for (let i = 0; i < numPlayersToRender; i++) {
            let row = playerTable.insertRow();
            row.classList.add('invisible');
            for (let j = 0; j < 6; j++) {
                row.insertCell();
            }
            row.onclick = () => this.highlightPlayer(i);
        }
    }

    setState(state) {
        this.players = [];
        for (let playerInfo of state.players) {
            if (playerInfo) this.players[playerInfo.id] = new Player(playerInfo);
        }
        this.levels = state.levels;
        this.render();
    }

    render() {
        if (this.highlightedPlayer) {
            let playerLevel = this.players[this.highlightedPlayer].levelNumber;
            if (playerLevel != 'jail') this.levelToRender = playerLevel;
        }
        let level = this.levels[this.levelToRender];
        this.renderTitle(level.name);
        this.map.render(level.map, this.players);
        this.renderPlayers(this.players);
        if (this.isShowing('player-tab')) {
            this.renderPlayerTab();
        }
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
        let playerTable = document.getElementById('players');
        for (let i = 0; i < numPlayersToRender; i++) {
            let row = playerTable.rows[i + 1];
            if (i < this.renderedPlayers.length) {
                row.classList.remove('invisible');
                let player = this.renderedPlayers[i];
                let cols = ['rank', 'score', 'levelNumber', 'textHandle', 'kills', 'deaths'];
                for (let j = 0; j < cols.length; j++) {
                    row.cells[j].innerHTML = player[cols[j]];
                }
                if (player.id == this.highlightedPlayer) {
                    row.classList.add('highlighted');
                } else {
                    row.classList.remove('highlighted');
                }
            } else {
                row.classList.add('invisible');
            }
        }
    }

    findPlayersToRender(players) {
        let result = [];
        if (this.client.credentials.playerId) {
            result.push(players[this.client.credentials.playerId]);
        }
        if (this.highlightedPlayer && this.highlightedPlayer != this.client.credentials.playerId) {
            result.push(players[this.highlightedPlayer]);
        }
        let topPlayers = players.filter(p => p);
        this.numPlayers = topPlayers.length;
        topPlayers.sort((a, b) => b.score - a.score);
        topPlayers.forEach((p, i) => p.rank = i + 1);
        for (let i = this.renderPlayersFrom; i < topPlayers.length; i++) {
            let player = topPlayers[i];
            if (result.some(p => p.id == player.id)) continue;
            result.push(player);
            if (result.length >= numPlayersToRender) break;
        }
        result.sort((a, b) => a.rank - b.rank);
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
        this.render();
    }

    switchLevel(dir) {
        delete this.highlightedPlayer;
        this.levelToRender += dir;
        this.levelToRender = Math.max(this.levelToRender, 0);
        this.levelToRender = Math.min(this.levelToRender, this.levels.length - 1);
        this.render();
    }

    showPlayers(dir) {
        if (dir == 0) this.renderPlayersFrom = 0;
        this.renderPlayersFrom += 10 * dir;
        this.renderPlayersFrom = Math.max(this.renderPlayersFrom, 0);
        this.renderPlayersFrom = Math.min(this.renderPlayersFrom, this.numPlayers - 10);
        this.render();
    }

    switchMap(dir) {
        switch (dir) {
            case -1: this.map = this.asciiMap; break;
            case 1: this.map = this.newMap; break;
        }
        this.render();
    }

    findHandle() {
        if (!players) return;
        let handle = document.getElementById('handle').value;
        let player = this.players.find(p => p && p.handle == handle);
        if (player) {
            this.highlightedPlayer = player.id;
            this.render();
            this.say('Highlighted ' + handle, 0);
        } else {
            this.say('Can\'t find ' + handle, 3);
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

    isShowing(tab) {
        return document.getElementById(tab).classList.contains('active');
    }

    setLog(log) {
        const logArea = document.getElementById('log-text');
        logArea.value = this.filterLog(log);
    }

    toggleFreeze() {
        let button = document.getElementById('freeze').classList.toggle('active');
        this.freezeLog = !this.freezeLog;
    }

    renderPlayerTab() {
        let playerIdToRender = this.highlightedPlayer?? this.client.credentials.playerId;
        if (!playerIdToRender) return;
        let playerInfo = this.players[playerIdToRender];
        this.renderPlayerInfo(playerInfo);
        this.renderPlayerStats(playerInfo);
        this.renderPlayerChart(playerInfo);
    }

    renderPlayerInfo(playerInfo) {
        let infoTable = document.getElementById('player-info');
        let rows = ['levelNumber', 'pos', 'dir', 'idle', 'offenses', 'jailtime', 'id', 'handle'];
        for (let i = 0; i < rows.length; i++) {
            this.setColumn(infoTable.rows[i], 1, playerInfo[rows[i]]);
        }
    }

    renderPlayerStats(playerInfo) {
        let statsTable = document.getElementById('player-stats');
        let totalTime = 0;
        for (let col = 0; col < 4; col++) {
            let values = [0, 0, 0, 0, 0, ''];
            let stats = playerInfo.statsArray[col == 0? 'jail': col - 1];
            if (stats) {
                totalTime += stats.timeSpent;
                values[0] = this.shorten(stats.timeSpent);
                values[1] = stats.timesCompleted;
                values[2] = this.renderRatio(stats.score, stats.timeSpent);
                values[3] = this.renderRatio(stats.timeSpent, stats.timesCompleted);
                values[4] = this.renderRatio(totalTime, stats.timesCompleted);
                if (col == 2 && stats.timesCompleted >= 10) {
                    values[5] = values[4] < 300? '&#x2713': 'x';
                }
            }
            for (let row = 0; row < values.length; row++) {
                this.setColumn(statsTable.rows[row + 1], col + 1, values[row]);
            }
       }
    }

    shorten(num) {
        if (num < 1000) return num;
        if (num < 1000000) return (num / 1000).toFixed(1) + 'k';
        return (num / 1000000).toFixed(1) + 'm';
    }

    renderRatio(x, y) {
        return (y > 0? x / y: 0).toFixed(2);
    }

    setColumn(row, col, text) {
        while (row.cells.length <= col) {
            let cell = row.insertCell(-1);
            cell.classList.add('table-col');
        }
        row.cells[col].innerHTML = Util.stringify(text);
    }

    renderPlayerChart(playerInfo) {
        let labels = ['cur'];
        for (let i = 1; i < playerInfo.chartData.length; i++) {
            labels.push(`cur - ${i * 5}`);
        }

        if (!this.chart) {
            Chart.defaults.color = 'black';
            this.chart = new Chart(document.getElementById('player-chart'), {
                type: 'line',
                options: {
                    scales: { y: { beginAtZero: true, suggestedMax: 2000 }},
                    animation: false,
                },
                data: {
                    datasets: [{
                        label: 'Score in five-minute intervals',
                        borderColor: '#808080',
                        backgroundColor: '#e0e0e0',
                        borderWidth: 1,
                        pointStyle: false,
                        fill: true,
                        labels: labels,
                        data: playerInfo.chartData,
                    }],
                },
            });
        } else {
            this.chart.data.datasets[0].data = playerInfo.chartData;
            this.chart.data.labels = labels;
            this.chart.update();
        }
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

    onMouseEnter() {
        document.getElementById('coords').classList.add('show');
    }

    onMouseMove(x, y) {
        let [col, row] = this.map.getPosAt(x, y);
        document.getElementById('x-coord').innerHTML = col;
        document.getElementById('y-coord').innerHTML = row;
    }

    onMouseLeave() {
        document.getElementById('coords').classList.remove('show');
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
}
