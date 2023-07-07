import Client from './client.js';

export default class Fetcher {
    constructor(
        private readonly client: Client
    ) {}

    async getJson<T>(name: string): Promise<T | null> {
        let response = await fetch(`${this.client.baseUrl}/api/${name}`);
        let result = await response.json();
        if (result.error) {
            this.client.display.say(result.error, 3);
            return null;
        }
        return result;
    }

    async postJson<T>(name: string, args: Object = {}): Promise<T | null> {
        let response = await fetch(
            `${this.client.baseUrl}/api/${name}`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(args),
            }
        );
        let result = await response.json();
        if (result.error) {
            this.client.display.say(result.error, 3);
            return null;
        }
        return result;
    }

    async getText(name: string): Promise<string> {
        let response = await fetch(`${this.client.baseUrl}/${name}`);
        return await response.text();
    }
}
