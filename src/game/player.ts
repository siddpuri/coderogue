import { PlayerData } from '../shared/protocol.js';
import Handles from '../shared/handles.js';

import { PlayerEntry } from '../server/db.js';

import CircularLog from './circular_log.js';

type Pos = [number, number];

const chartLength = 100;

export default class Player {
    readonly id: number;
    readonly authToken: string;
    readonly handle: number;

    levelNumber = 0;
    pos: Pos = [0, 0];
    dir = 0;
    idle = 0;
    offenses = 0;
    jailtime = 0;
    chartData = Array(chartLength).fill(0);
    timeSpent: number[] = [];
    timesCompleted: number[] = [];
    kills: number[] = [];
    deaths: number[] = [];
    score: number[] = [];

    readonly log = new CircularLog(1000);
    action: (() => void) | null = null;;

    dontScore = false;
    rank = 0;
    turns = 0;

    constructor(dbEntry: PlayerEntry) {
        this.id = dbEntry.id;
        this.authToken = dbEntry.auth_token;
        this.handle = dbEntry.handle;
    }

    get isInJail() { return this.levelNumber == 0; }
    get textHandle() { return Handles.getTextHandle(this.handle); }
    get totalScore() { return this.score.reduce((a, b) => a + b, 0); }

    incrementTimeSpent(): void { this.addAtLevel(this.timeSpent, 1); }
    incrementTimesCompleted(): void { this.addAtLevel(this.timesCompleted, 1); }
    incrementKills(): void { this.addAtLevel(this.kills, 1); }
    incrementDeaths(): void { this.addAtLevel(this.deaths, 1); }

    addScore(score: number): void {
        if (this.dontScore) return;
        this.addAtLevel(this.score, score);
        this.chartData[0] += score;
    }

    addAtLevel(array: number[], x: number): void {
        while (array.length <= this.levelNumber) array.push(0);
        array[this.levelNumber] += x;
    }

    addChartInterval(): void {
        this.chartData.unshift(0);
        if (this.chartData.length > chartLength) this.chartData.pop();
    }

    useTurn(): boolean {
        if (this.turns > 0) {
            this.turns--;
            return true;
        } else {
            this.log.write('Tried to do multiple actions in a turn.');
            return false;
        }
    }

    onNewCode(): void {
        this.action = null;
        this.idle = 0;
        this.offenses = 0;
        this.jailtime = 0;
        this.log.write('New code loaded.');
    }

    getState(): PlayerData {
        return {
            id: this.id,
            handle: this.handle,
            levelNumber: this.levelNumber,
            pos: this.pos,
            dir: this.dir,
            idle: this.idle,
            offenses: this.offenses,
            jailtime: this.jailtime,
            chartData: this.chartData,
            timeSpent: this.timeSpent,
            timesCompleted: this.timesCompleted,
            kills: this.kills,
            deaths: this.deaths,
            score: this.score,
        };
    }
}
