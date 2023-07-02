export default class CircularLog {
    private readonly buffer: string[];
    private cur = 0;
    private goneAround = false;

    constructor(length: number) {
        this.buffer = Array(length);
    }

    write(text: string) {
        text = this.applyTimeStamp(text);
        this.buffer[this.cur] = text;
        this.cur++;
        if (this.cur >= this.buffer.length) {
            this.cur = 0;
            this.goneAround = true;
        }
    }

    private applyTimeStamp(text: string) {
        const now = new Date();
        const minutes = now.getMinutes().toString().padStart(2, '0');
        const seconds = now.getSeconds().toString().padStart(2, '0');
        const stamp = `[${minutes}:${seconds}] `;
        return text.split('\n').map(line => stamp + line).join('\n');
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
