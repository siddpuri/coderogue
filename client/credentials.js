const expire_never = ';expires=Fri, 31 Dec 9999 23:59:59 GMT';
const expire_now = ';expires=Thu, 01 Jan 1970 00:00:00 GMT';

export default class Credentials {
    constructor(client) {
        this.client = client;
    }

    async start() {
        this.readCookie();
    }

    get isLoggedIn() {
        return Object.hasOwn(this, 'playerId');
    }

    readCookie() {
        let cookies = document.cookie.split('; ');
        for (let cookie of cookies) {
            let [name, value] = cookie.split('=');
            if (name == 'playerId') {
                this.playerId = value;
            }
            if (name == 'authToken') {
                this.authToken = value;
            }
            if (name == 'handle') {
                this.handle = value;
            }
        }
    }

    writeCookie(key, value) {
        document.cookie = `${key}=${value}${expire_never}`;
    }

    deleteCookie(key) {
        document.cookie = `${key}=;${expire_now}`
    }

    async login(serverResponse) {
        this.playerId = serverResponse.playerId;
        this.authToken = serverResponse.authToken;
        this.handle = serverResponse.handle;
        this.writeCookie('playerId', this.playerId);
        this.writeCookie('authToken', this.authToken);
        this.writeCookie('handle', this.handle);
        this.client.onLogin();
        return true;
    }

    async logout() {
        delete this.authToken;
        delete this.playerId;
        delete this.handle;
        this.deleteCookie('playerId');
        this.deleteCookie('authToken');
        this.deleteCookie('handle');
        this.client.onLogout();
    }
}
