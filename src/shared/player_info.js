import Util from './util.js';

const chartLength = 100;
const numLevels = 5;

export default class PlayerInfo {
    constructor(info) {
        // These may come from either the database or a serialized PlayerInfo.
        this.id = info.id;
        this.handle = info.handle;

        // These come from a serialized PlayerInfo or are set to default values.
        this.levelNumber = info.levelNumber?? 0;
        this.pos = info.pos?? [0, 0];
        this.dir = info.dir?? 0;
        this.idle = info.idle?? 0;
        this.offenses = info.offenses?? 0;
        this.jailtime = info.jailtime?? 0;
        this.chartData = info.chartData?? new Array(chartLength).fill(0);

        // Per-level stats
        this.timeSpent = info.timeSpent?? new Array(numLevels).fill(0);
        this.timesCompleted = info.timesCompleted?? new Array(numLevels).fill(0);
        this.kills = info.kills?? new Array(numLevels).fill(0);
        this.deaths = info.deaths?? new Array(numLevels).fill(0);
        this.score = info.score?? new Array(numLevels).fill(0);
    }

    get isInJail() { return this.levelNumber == 0; }
    get textHandle() { return Util.getTextHandle(this.handle); }
    get totalScore() { return this.score.reduce((a, b) => a + b, 0); }

    incrementTimeSpent() { this.timeSpent[this.levelNumber]++; }
    incrementTimesCompleted() { this.timesCompleted[this.levelNumber]++; }
    incrementKills() { this.kills[this.levelNumber]++; }
    incrementDeaths() { this.deaths[this.levelNumber]++; }

    addScore(score) {
        if (this.dontScore) return;
        this.score[this.levelNumber] += score;
        this.chartData[0] += score;
    }

    addChartInterval() {
        this.chartData.unshift(0);
        if (this.chartData.length > chartLength) this.chartData.pop();
    }

    getState() {
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
