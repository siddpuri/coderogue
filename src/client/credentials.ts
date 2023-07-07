import Client from './client.js';
import { LoginResponse } from '../shared/protocol.js';

const expire_never = ';expires=Fri, 31 Dec 9999 23:59:59 GMT';
const expire_now = ';expires=Thu, 01 Jan 1970 00:00:00 GMT';

export default class Credentials {
    playerId: number | null = null;
    authToken: string | null = null;
    textHandle: string | null = null;

    constructor(
        private readonly client: Client
    ) {}

    async start(): Promise<void> {
        this.readCookie();
    }

    get isLoggedIn(): boolean {
        return this.playerId !== null;
    }

    readCookie(): void {
        let cookies = document.cookie.split('; ');
        for (let cookie of cookies) {
            let [name, value] = cookie.split('=');
            switch (name) {
                case 'playerId': this.playerId = Number(value); break;
                case 'authToken': this.authToken = value; break;
                case 'textHandle': this.textHandle = value; break;
            }
        }
    }

    writeCookie(key: string, value: string | number): void {
        document.cookie = `${key}=${value}${expire_never}`;
    }

    deleteCookie(key: string): void {
        document.cookie = `${key}=;${expire_now}`
    }

    async onLogin(serverResponse: LoginResponse): Promise<void> {
        this.playerId = serverResponse.playerId;
        this.authToken = serverResponse.authToken;
        this.textHandle = serverResponse.textHandle;
        this.writeCookie('playerId', serverResponse.playerId);
        this.writeCookie('authToken', serverResponse.authToken);
        this.writeCookie('textHandle', serverResponse.textHandle);
        this.client.onLogin();
    }

    async onLogout(): Promise<void> {
        this.authToken = null;
        this.playerId = null;
        this.textHandle = null;
        this.deleteCookie('playerId');
        this.deleteCookie('authToken');
        this.deleteCookie('textHandle');
        this.client.onLogout();
    }
}
