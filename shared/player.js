import Util from './util.js';

// Per-level fields
class PlayerStats {
    constructor() {
        this.timeSpent = 0;
        this.timesCompleted = 0;
        this.kills = 0;
        this.deaths = 0;
        this.score = 0;
    }
}

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
        this.chartData = info.chartData?? [0];

        this.statsArray = [];
        if (info.statsArray) {
            for (let key in info.statsArray) {
                this.statsArray[key] = info.statsArray[key];
            }
        }

        // Fields only meaningful on the server
        this.action = null;
        this.log = null;
        this.turns = 0;
    }

    get textHandle() { return Util.getTextHandle(this.handle); }

    get levelNumber() {
        if (!this.level) return 'jail';
        return this.level.levelNumber;
    }

    get stats() {
        if (!this.statsArray[this.levelNumber]) {
            this.statsArray[this.levelNumber] = new PlayerStats();
        }
        return this.statsArray[this.levelNumber];
    }

    get score() { return this.statsArray.reduce((a, s) => a + s.score, 0); }
    get kills() { return this.statsArray.reduce((a, s) => a + s.kills, 0); }
    get deaths() { return this.statsArray.reduce((a, s) => a + s.deaths, 0); }

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

    incrementTimeSpent() { this.stats.timeSpent++; }
    incrementTimesCompleted() { this.stats.timesCompleted++; }
    incrementKills() { this.stats.kills++; }
    incrementDeaths() { this.stats.deaths++; }

    addScore(score) {
        this.stats.score += score;
        this.chartData[0] += score;
    }

    addChartInterval() {
        this.chartData.unshift(0);
        if (this.chartData.length > 100) this.chartData.pop();
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
            statsArray: { ...this.statsArray },
            chartData: this.chartData,
        };
    }
}
