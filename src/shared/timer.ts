const numTimes = 100;

export default class Timer {
    private times: number[] = [];
    private index = 0;
    private startTime = Date.now();
    private lastTime = 0;

    start() {
        this.startTime = Date.now();
    }

    stop() {
        this.lastTime = Date.now() - this.startTime;
        this.times[this.index] = this.lastTime;
        this.index = (this.index + 1) % numTimes;
    }

    log() {
        if (this.times.length < numTimes) {
            console.log(`Time: ${this.lastTime}`);
            return;
        }
        let average = this.times.reduce((a, b) => a + b, 0) / numTimes;
        let variance = this.times.reduce((a, b) => a + (b - average) ** 2, 0) / numTimes;
        let sigma = Math.sqrt(variance);
        console.log(`Time: ${this.lastTime} (${Math.round(average)} +- ${Math.round(sigma)})`);
    }
}
