import { LogResponse } from '../../shared/protocol.js';

const maxEntries = 2;

export default class Log {
    private entries: { timestamp: string, lines: string[] }[] = [];
    private isEntryOpen = false;

    startEntry(): void {
        let now = new Date();
        let minutes = now.getMinutes().toString().padStart(2, '0');
        let seconds = now.getSeconds().toString().padStart(2, '0');
        let timestamp = `[${minutes}:${seconds}] `;
        this.entries.push({ timestamp, lines: [] });
        this.entries = this.entries.slice(-maxEntries);
        this.isEntryOpen = true;
    }

    finishEntry(): void {
        this.isEntryOpen = false;
    }

    write(text: string): void {
        let isBetweenEntries = this.entries.length == 0;
        if (isBetweenEntries) this.startEntry();
        this.entries[this.entries.length - 1].lines.push(text);
        if (isBetweenEntries) this.finishEntry();
    }

    getEntries(): LogResponse {
        let entries = this.entries;
        if (this.isEntryOpen) {
            entries = entries.slice(0, -1);
            this.entries = [this.entries[this.entries.length - 1]];
        } else {
            this.entries = [];
        }
        return entries;
    }
}
