import Chart, { ChartItem, Tick } from 'chart.js/auto';

import Util from '../shared/util.js';
import { StateResponse, PlayerData, LevelData } from '../shared/protocol.js';
import Grownups from '../shared/grownups.js';
import Handles from '../shared/handles.js';

import Client from './client.js';
import CanvasMap from './canvas_map.js';

type Player = PlayerData & {
    textHandle: string,
    totalScore: number,
    rank: number
};

const alertLevels = [
    'alert-success',
    'alert-secondary',
    'alert-warning',
    'alert-danger',
];

const numPlayersToRender = 10;
const chartLength = 100;

export default class Display {
    private levelToRender = 1;
    private renderPlayersFrom = 0;
    private numPlayers = 0;
    private renderedPlayers: Player[] = [];
    private messageNumber = 0;
    private messagesToShow = 'all';
    map: CanvasMap;
    highlightedPlayer: number | null = null;
    logIsFrozen = false;
    private players: Player[] = [];
    private levels: LevelData[] = [];
    private chart!: Chart;

    readonly keybindings: { [key: string]: () => void } = {
        'C-s':           () => this.client.buttonHooks.submit(),
        'C-[':           () => this.switchTab(-1),
        'C-]':           () => this.switchTab(1),
        'C-ArrowUp':     () => this.switchLevel(1),
        'C-ArrowDown':   () => this.switchLevel(-1),
        'C-S-ArrowUp':   () => this.map.setStyle(1),
        'C-S-ArrowDown': () => this.map.setStyle(0),
    };

    constructor(
        private readonly client: Client
    ) {
        this.map = new CanvasMap(client);
    }

    async start(): Promise<void> {
        await this.map.start();
        this.createPlayerRows();
        this.createPlayerTabColumns();
        this.createPlayerTabChart();
    }

    private element(id: string): HTMLElement {
        return document.getElementById(id) as HTMLElement;
    }

    private getText(id: string): string {
        let textField = this.element(id) as HTMLInputElement;
        return textField.value;
    }

    private setText(id:string, text: string): void {
        let textField = this.element(id) as HTMLInputElement;
        textField.value = text;
    }

    private classList(id: string): DOMTokenList {
        return this.element(id).classList;
    }

    createPlayerRows(): void {
        let playerTable = this.element('players') as HTMLTableElement;
        for (let i = 0; i < numPlayersToRender; i++) {
            let row = playerTable.insertRow();
            row.classList.add('invisible');
            for (let j = 0; j < 6; j++) {
                row.insertCell();
            }
            row.onclick = () => this.highlightPlayer(i);
        }
    }

    createPlayerTabColumns(): void {
        let table = this.element('player-stats') as HTMLTableElement;
        let targetLength = table.rows[0].cells.length;
        for (let i = 1; i < table.rows.length; i++) {
            let row = table.rows[i];
            while (row.cells.length < targetLength) {
                let cell = row.insertCell(-1);
                cell.classList.add('table-col');
            }
        }
    }

    createPlayerTabChart(): void {
        Chart.defaults.color = 'black';
        this.chart = new Chart(this.element('player-chart') as ChartItem, {
            type: 'line',
            options: {
                scales: {
                    x: { ticks: { callback: this.tickFunction.bind(this) }},
                    y: { beginAtZero: true, suggestedMax: 2000 }
                },
                animation: false,
                plugins: {
                    legend: { display: false },
                }
            },
            data: {
                labels: new Array(chartLength).fill(0),
                datasets: [{
                    label: 'Score in five-minute intervals',
                    borderColor: '#808080',
                    backgroundColor: '#e0e0e0',
                    borderWidth: 1,
                    pointStyle: false,
                    fill: true,
                    data: new Array(chartLength).fill(0),
                }],
            },
        });
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    tickFunction(value: string | number, index: number, ticks: Tick[]): string | undefined {
        if (index % 12 != 0) return undefined;
        if (index == 0) return 'cur';
        return `${index / 12}h`;
    }

    setState(state: StateResponse): void {
        this.players = [];
        for (let playerData of state.players) {
            if (!playerData) continue;
            this.players[playerData.id] = {
                ...playerData,
                textHandle: Handles.getTextHandle(playerData.handle),
                totalScore: playerData.score.reduce((a, b) => a + b, 0),
                rank: 0,
            };
        }
        this.levels = state.levels;
        this.render();
    }

    render(): void {
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

    renderTitle(name: string): void {
        let span = this.element('level');
        span.removeChild(span.firstChild as Node);
        span.appendChild(document.createTextNode(this.levelToRender.toString()));
        span = this.element('level-name');
        span.removeChild(span.firstChild as Node);
        span.appendChild(document.createTextNode(name));
    }

    renderPlayers(players: Player[]): void {
        this.renderedPlayers = this.findPlayersToRender(players);
        let playerTable = this.element('players') as HTMLTableElement;
        for (let i = 0; i < numPlayersToRender; i++) {
            let row = playerTable.rows[i + 1];
            if (i < this.renderedPlayers.length) {
                row.classList.remove('invisible');
                let player = this.renderedPlayers[i];
                row.cells[0].innerHTML = player.rank.toString();
                row.cells[1].innerHTML = player.totalScore.toString();
                row.cells[2].innerHTML = player.levelNumber? player.levelNumber.toString(): 'J';
                row.cells[3].innerHTML = player.textHandle;
                row.cells[4].innerHTML = player.kills.reduce((a, b) => a + b, 0).toString();
                row.cells[5].innerHTML = player.deaths.reduce((a, b) => a + b, 0).toString();
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

    findPlayersToRender(players: Player[]): Player[] {
        let result = [];
        let topPlayers = players.filter(p => p);
        if (this.client.credentials.playerId) {
            result.push(players[this.client.credentials.playerId]);
        }
        if (!Grownups.includes(this.client.credentials.playerId)) {
            topPlayers.forEach(p => {
                if (!Grownups.includes(p.id)) return;
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

    highlightPlayer(index: number): void {
        this.toggleHighlight(this.renderedPlayers[index].id);
    }

    toggleHighlight(playerId: number | null): void {
        if (!playerId) return;
        if (playerId == this.highlightedPlayer) {
            this.highlightedPlayer = null;
        } else {
            this.highlightedPlayer = playerId;
        }
        this.render();
    }

    switchLevel(dir: number): void {
        this.highlightedPlayer = null;
        this.levelToRender += dir;
        this.levelToRender = Math.max(this.levelToRender, 1);
        this.levelToRender = Math.min(this.levelToRender, this.levels.length - 1);
        this.render();
    }

    showPlayers(dir: number): void {
        let step = numPlayersToRender - 2;
        if (dir == 0) this.renderPlayersFrom = 0;
        this.renderPlayersFrom += step * dir;
        this.renderPlayersFrom = Math.max(this.renderPlayersFrom, 0);
        this.renderPlayersFrom = Math.min(this.renderPlayersFrom, this.numPlayers - step);
        this.render();
    }

    findHandle(): void {
        if (!this.players) return;
        let handle = this.getText('handle');
        let player = this.players.find(p => p && p.textHandle == handle);
        if (player) {
            this.highlightedPlayer = player.id;
            this.render();
            this.say(`Highlighted ${handle}.`, 0);
        } else {
            this.say(`Can't find ${handle}.`, 3);
        }
    }

    setCode(code: string): void {
        // this.client.editor.code = code;
    }

    getCode(): string {
        return '';
        // return this.client.editor.code;
    }

    isShowing(tab: string): boolean {
        return this.classList(tab).contains('active');
    }

    setLog(log: string): void {
        this.setText('log-text', log);
    }

    toggleFreeze(): void {
        this.classList('freeze').toggle('active');
        this.logIsFrozen = !this.logIsFrozen;
    }

    renderPlayerTab(): void {
        let playerIdToRender = this.highlightedPlayer?? this.client.credentials.playerId;
        if (!playerIdToRender) return;
        let player = this.players[playerIdToRender];
        this.renderPlayer(player);
        this.renderPlayerStats(player);
        this.renderPlayerChart(player);
    }

    renderPlayer(player: Player): void {
        let infoTable = this.element('player-info') as HTMLTableElement;
        [
            player.levelNumber.toString(),
            Util.stringify(player.pos),
            player.dir.toString(),
            player.idle.toString(),
            player.offenses.toString(),
            player.jailtime.toString(),
            player.id.toString(),
            player.handle.toString(),
        ].forEach((x, i) => infoTable.rows[i].cells[1].innerHTML = x);
    }

    renderPlayerStats(player: Player): void {
        let statsTable = this.element('player-stats') as HTMLTableElement;
        let cumulative = [player.timeSpent[0]];
        for (let i = 1; i < player.timeSpent.length; i++) {
            cumulative[i] = cumulative[i - 1] + player.timeSpent[i];
        }
        let values = [
            player.timeSpent.map(x => this.shorten(x)),
            player.timesCompleted,
            player.score.map((x, i) => this.renderRatio(x, player.timeSpent[i])),
            player.timesCompleted.map((x, i) => this.renderRatio(player.timeSpent[i], x)),
            player.timesCompleted.map((x, i) => this.renderRatio(cumulative[i], x)),
        ];
        for (let i = 0; i < values.length; i++) {
            let row = statsTable.rows[i + 1];
            for (let j = 0; j < values[i].length; j++) {
                row.cells[j + 1].innerHTML = Util.stringify(values[i][j]);
            }
        }
        if (player.timesCompleted[2] >= 10) {
            let symbol = this.isGoalMet(player)? '&#x2713': 'x';
            statsTable.rows[6].cells[3].innerHTML = symbol;
        }
    }

    shorten(num: number): string {
        if (num < 1000) return num.toString();
        if (num < 1000000) return (num / 1000).toFixed(1) + 'k';
        return (num / 1000000).toFixed(1) + 'm';
    }

    renderRatio(x: number, y: number): string {
        let value = (y > 0? x / y: 0).toFixed(1);
        return this.shorten(Number(value));
    }

    printPassed(): void {
        let passed = this.players.filter(p => p && this.isGoalMet(p));
        console.log(passed.map(p => p.id).join(' '));
    }

    isGoalMet(player: Player): boolean {
        let timesCompleted = player.timesCompleted[2];
        if (timesCompleted < 10) return false;
        let totalTime = 0;
        for (let l = 0; l <= 2; l++) {
            totalTime += player.timeSpent[l];
        }
        return totalTime / timesCompleted < 300;
    }

    renderPlayerChart(player: Player): void {
        this.chart.data.datasets[0].data = player.chartData;
        this.chart.update();
    }

    showAll(): void {
        this.classList('show-all').add('active');
        this.classList('show-latest').remove('active');
        this.classList('show-filtered').remove('active');
        this.messagesToShow = 'all';
    }

    showLatest(): void {
        this.classList('show-all').remove('active');
        this.classList('show-latest').add('active');
        this.classList('show-filtered').remove('active');
        this.messagesToShow = 'latest';
    }

    showFiltered(): void {
        this.classList('show-all').remove('active');
        this.classList('show-latest').remove('active');
        this.classList('show-filtered').add('active');
        this.messagesToShow = 'filtered';
    }

    filterLog(log: string): string {
        let lines = log.split('\n');
        let filter = '';
        if (this.messagesToShow == 'latest' && lines.length > 0) {
            filter = lines[lines.length - 1].slice(0, 8);
        }
        if (this.messagesToShow == 'filtered') {
            filter = this.getText('filter-text');
        }
        lines = lines.filter(line => line.includes(filter));
        lines.reverse();
        return lines.join('\n');
    }

    onMouseEnter(): void {
        this.classList('coords').add('show');
    }

    onMouseMove(event: MouseEvent): void {
        let [col, row] = this.map.getPosAt(event.offsetX, event.offsetY);
        this.element('x-coord').innerHTML = col.toString();
        this.element('y-coord').innerHTML = row.toString();
    }

    onMouseLeave(): void {
        this.classList('coords').remove('show');
    }

    highlightTile(event: MouseEvent): void {
        this.toggleHighlight(this.map.getPlayerAt(event.offsetX, event.offsetY));
    }

    showLoggedIn(): void {
        this.classList('login-form').add('d-none');
        this.classList('logout-form').remove('d-none');
        this.element('user-handle').innerHTML = this.client.credentials.textHandle as string;
    }

    showLoggedOut(): void {
        this.classList('login-form').remove('d-none');
        this.classList('logout-form').add('d-none');
    }

    switchTab(dir: number): void {
        let navLinks = document.getElementsByClassName('nav-link') as HTMLCollectionOf<HTMLAnchorElement>;
        let activeIndex = 0;
        for (let i = 0; i < navLinks.length; i++) {
            if (navLinks[i].classList.contains('active')) {
                activeIndex = i;
            }
        }
        let newIndex = (activeIndex + dir + navLinks.length) % navLinks.length;
        navLinks[newIndex].click();
    }

    say(message: string, level: number): void {
        const n = ++this.messageNumber;
        const div = this.element('message');
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
