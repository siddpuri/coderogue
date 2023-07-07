export default class Util {
    static randomInt(min: number, max: number): number {
        return Math.floor(Math.random() * (max - min)) + min;
    }

    static randomElement<T>(list: Array<T>): T {
        return list[Math.floor(Math.random() * list.length)];
    }

    static stringify(obj: any): string {
        if (Array.isArray(obj)) {
            return `[${obj.map(e => this.stringify(e)).join(', ')}]`;
        }
        return String(obj);
    }
}
