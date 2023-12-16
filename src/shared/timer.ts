const reportInterval = 60 * 60; // 1 hour

export default class Timer {
    private times: number[] = [];
    private startTime = Date.now();

    start() {
        this.startTime = Date.now();
    }

    stop() {
        this.times.push(Date.now() - this.startTime);
        if (this.times.length >= reportInterval) {
            this.log();
            this.times = [];
        }
    }

    log() {
        let average = this.times.reduce((a, b) => a + b, 0) / reportInterval;
        let variance = this.times.reduce((a, b) => a + (b - average) ** 2, 0) / reportInterval;
        let sigma = Math.sqrt(variance);
        console.log(`Load: ${Math.round(average) / 10}% +- ${Math.round(sigma) / 10}%`);
    }
}
