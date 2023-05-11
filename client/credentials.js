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

    async login(credentials) {
        let response = await fetch(
            this.client.baseUrl + '/api/login',
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(credentials),
            }
        );
        let result = await response.json();
        if (result.error) {
            return false;
        }
        this.playerId = result.playerId;
        this.authToken = result.authToken;
        this.handle = result.handle;
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
