import Util from './shared/util.js';
import PlayerInfo from './shared/player_info.js';
import Grownups from './shared/grownups.js';
import LevelMap from './shared/level_map.js';

import CanvasMap from './canvas_map.js';
import MonacoEditor from './monaco_editor.js';

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
        this.map = new CanvasMap(client, 'canvas');
        this.levelToRender = 1;
        this.renderPlayersFrom = 0;
        this.numPlayers = 0;
        this.renderedPlayers = [];
        this.messageNumber = 0;
        this.freezeLog = false;
        this.messagesToShow = 'all';
    }

    async start() {
        await this.map.start();
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
            if (playerInfo) this.players[playerInfo.id] = new PlayerInfo(playerInfo);
        }
        this.levels = state.levels;
        for (let level of this.levels) {
            level.map = new LevelMap(level.map);
        }
        this.render();
    }

    render() {
        if (this.highlightedPlayer) {
            let playerLevel = this.players[this.highlightedPlayer].levelNumber;
            if (playerLevel != 0) this.levelToRender = playerLevel;
        }
        let level = this.levels[this.levelToRender];
        this.renderTitle(level.name);
        this.map.render(level, this.players);
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
                    let value = player[cols[j]];
                    if (Array.isArray(value)) value = value.reduce((a, b) => a + b, 0);
                    row.cells[j].innerHTML = value;
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
        let topPlayers = players.filter(p => p);
        if (this.client.credentials.playerId) {
            result.push(players[this.client.credentials.playerId]);
        }
        if (!Grownups.list.includes(this.client.credentials.playerId)) {
            topPlayers.forEach(p => {
                if (!Grownups.list.includes(p.id)) return;
                p.score = new Array(p.score.length).fill(0);
            });
        }
        if (this.highlightedPlayer && this.highlightedPlayer != this.client.credentials.playerId) {
            result.push(players[this.highlightedPlayer]);
        }
        this.numPlayers = topPlayers.length;
        topPlayers.sort((a, b) => b.totalScore - a.totalScore);
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
        this.levelToRender = Math.max(this.levelToRender, 1);
        this.levelToRender = Math.min(this.levelToRender, this.levels.length - 1);
        this.render();
    }

    showPlayers(dir) {
        let step = numPlayersToRender - 2;
        if (dir == 0) this.renderPlayersFrom = 0;
        this.renderPlayersFrom += step * dir;
        this.renderPlayersFrom = Math.max(this.renderPlayersFrom, 0);
        this.renderPlayersFrom = Math.min(this.renderPlayersFrom, this.numPlayers - step);
        this.render();
    }

    findHandle() {
        if (!players) return;
        let handle = document.getElementById('handle').value;
        let player = this.players.find(p => p && p.textHandle == handle);
        if (player) {
            this.highlightedPlayer = player.id;
            this.render();
            this.say(`Highlighted ${handle}.`, 0);
        } else {
            this.say(`Can't find ${handle}.`, 3);
        }
    }

    setCode(code) {
        MonacoEditor.instance().setValue(code);
    }

    getCode() {
        return MonacoEditor.instance().getValue();
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
            infoTable.rows[i].cells[1].innerHTML = Util.stringify(playerInfo[rows[i]]);
        }
    }

    renderPlayerStats(playerInfo) {
        let statsTable = document.getElementById('player-stats');
        this.ensureColumns(statsTable);
        let cumulative = [playerInfo.timeSpent[0]];
        for (let i = 1; i < playerInfo.timeSpent.length; i++) {
            cumulative[i] = cumulative[i - 1] + playerInfo.timeSpent[i];
        }
        let values = [
            playerInfo.timeSpent.map(x => this.shorten(x)),
            playerInfo.timesCompleted,
            playerInfo.score.map((x, i) => this.renderRatio(x, playerInfo.timeSpent[i])),
            playerInfo.timesCompleted.map((x, i) => this.renderRatio(playerInfo.timeSpent[i], x)),
            playerInfo.timesCompleted.map((x, i) => this.renderRatio(cumulative[i], x)),
        ];
        for (let i = 0; i < values.length; i++) {
            let row = statsTable.rows[i + 1];
            for (let j = 0; j < values[i].length; j++) {
                row.cells[j + 1].innerHTML = Util.stringify(values[i][j]);
            }
        }
        if (playerInfo.timesCompleted[2] >= 10) {
            let symbol = this.isGoalMet(playerInfo)? '&#x2713': 'x'
            table.rows[6].cells[2].innerHTML = symbol;
        }
    }

    ensureColumns(table) {
        let targetLength = table.rows[0].cells.length;
        for (let i = 1; i < table.rows.length; i++) {
            let row = table.rows[i];
            while (row.cells.length < targetLength) {
                let cell = row.insertCell(-1);
                cell.classList.add('table-col');
            }
        }
    }

    shorten(num) {
        if (num < 1000) return num;
        if (num < 1000000) return (num / 1000).toFixed(1) + 'k';
        return (num / 1000000).toFixed(1) + 'm';
    }

    renderRatio(x, y) {
        return this.shorten((y > 0? x / y: 0).toFixed(1));
    }

    printPassed() {
        let passed = this.players.filter(p => p && this.isGoalMet(p));
        console.log(passed.map(p => p.id).join(' '));
    }

    isGoalMet(playerInfo) {
        let timesCompleted = playerInfo.timesCompleted[2];
        if (timesCompleted < 10) return false;
        let totalTime = 0;
        for (let l = 0; l <= 2; l++) {
            totalTime += playerInfo.timeSpent[l];
        }
        return totalTime / timesCompleted < 300;
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
        document.getElementById('user-handle').innerHTML = this.client.credentials.textHandle;
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
