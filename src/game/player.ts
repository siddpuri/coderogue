import PlayerInfo, { Info } from '../shared/player_info.js';

import CircularLog from './circular_log.js';

export type InfoPlus = Info & { auth_token: string };

const chartLength = 100;

export default class Player extends PlayerInfo {
    readonly authToken: string;
    readonly log = new CircularLog(1000);
    action: (() => void) | null = null;;
    turns = 0;

    constructor(info: InfoPlus) {
        super(info);
        this.authToken = info.auth_token;
    }

    incrementTimeSpent() { this.addAtLevel(this.timeSpent, 1); }
    incrementTimesCompleted() { this.addAtLevel(this.timesCompleted, 1); }
    incrementKills() { this.addAtLevel(this.kills, 1); }
    incrementDeaths() { this.addAtLevel(this.deaths, 1); }

    addScore(score: number) {
        if (this.dontScore) return;
        this.addAtLevel(this.score, score);
        this.chartData[0] += score;
    }

    addAtLevel(array: number[], x: number) {
        while (array.length <= this.levelNumber) array.push(0);
        array[this.levelNumber] += x;
    }

    addChartInterval() {
        this.chartData.unshift(0);
        if (this.chartData.length > chartLength) this.chartData.pop();
    }

    useTurn() {
        if (this.turns > 0) {
            this.turns--;
            return true;
        } else {
            this.log.write('Tried to do multiple actions in a turn.');
            return false;
        }
    }

    onNewCode() {
        this.action = null;
        this.idle = 0;
        this.offenses = 0;
        this.jailtime = 0;
        this.log.write('New code loaded.');
    }
}
