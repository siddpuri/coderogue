import Util from './util.js';

const chartLength = 100;
const numLevels = 5;

export default class Player {
    constructor(info) {
        this.id = info.id;
        this.authToken = info.auth_token?? null;
        this.handle = info.handle;

        this.level = info.level?? null;
        this.pos = info.pos?? null;
        this.dir = info.dir?? null;
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

        // Fields only meaningful on the server
        this.action = null;
        this.log = null;
        this.turns = 0;
    }

    get isInJail() { return this.levelNumber == 0; }
    get textHandle() { return Util.getTextHandle(this.handle); }
    get levelNumber() { return this.level.levelNumber; }
    get totalScore() { return this.score.reduce((a, b) => a + b, 0); }

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
            level: { levelNumber: this.levelNumber },
            pos: this.pos,
            dir: this.dir,
            idle: this.idle,
            offenses: this.offenses,
            jailtime: this.jailtime,
            timeSpent: this.timeSpent,
            timesCompleted: this.timesCompleted,
            kills: this.kills,
            deaths: this.deaths,
            score: this.score,
            chartData: this.chartData,
        };
    }
}
