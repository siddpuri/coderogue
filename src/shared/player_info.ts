import Handles from './handles.js';

const chartLength = 100;

export interface Info {
    id: number;
    handle: number;
    levelNumber?: number;
    pos?: [number, number];
    dir?: number;
    idle?: number;
    offenses?: number;
    jailtime?: number;
    chartData?: number[];
    timeSpent?: number[];
    timesCompleted?: number[];
    kills?: number[];
    deaths?: number[];
    score?: number[];
}

export default class PlayerInfo implements Info {
    readonly id: number;
    readonly handle: number;
    levelNumber: number;
    pos: [number, number];
    dir: number;
    idle: number;
    offenses: number;
    jailtime: number;
    chartData: number[];
    timeSpent: number[];
    timesCompleted: number[];
    kills: number[];
    deaths: number[];
    score: number[];
    dontScore = false;
    rank = 0;

    constructor(info: Info) {
        // These may come from either the database or a serialized PlayerInfo.
        this.id = info.id;
        this.handle = info.handle;

        // These come from a serialized PlayerInfo.
        this.levelNumber = info.levelNumber?? 0;
        this.pos = info.pos?? [0, 0];
        this.dir = info.dir?? 0;
        this.idle = info.idle?? 0;
        this.offenses = info.offenses?? 0;
        this.jailtime = info.jailtime?? 0;
        this.chartData = info.chartData?? new Array(chartLength).fill(0);
        
        // Per-level stats
        this.timeSpent = info.timeSpent?? [];
        this.timesCompleted = info.timesCompleted?? [];
        this.kills = info.kills?? [];
        this.deaths = info.deaths?? [];
        this.score = info.score?? [];
    }

    get isInJail() { return this.levelNumber == 0; }
    get textHandle() { return Handles.getTextHandle(this.handle); }
    get totalScore() { return this.score.reduce((a, b) => a + b, 0); }

    getState(): Info {
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
