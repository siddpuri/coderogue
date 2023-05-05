export default class CircularLog {
    constructor(length) {
        this.buffer = Array(length);
        this.cur = 0;
        this.goneAround = false;
    }

    write(text) {
        this.buffer[this.cur] = text;
        this.cur++;
        if (this.cur >= this.buffer.length) {
            this.cur = 0;
            this.goneAround = true;
        }
    }

    toString() {
        let parts = [];
        if (this.goneAround) {
            parts.push(this.buffer.slice(this.cur, this.buffer.length));
        }
        if (this.cur > 0) {
            parts.push(this.buffer.slice(0, this.cur));
        }
        return parts.map(a => a.join('\n')).join('\n');
    }
}