export default class Credentials {
    constructor(client) {
        this.client = client;
        this.playerId = undefined;;
        this.authToken = undefined;
    }

    start() {
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
        }
    }

    writeCookie(key, value) {
        document.cookie = `${key}=${value}; expires=${2**31-1};`;
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
        this.writeCookie('playerId', this.playerId);
        this.writeCookie('authToken', this.authToken);
        this.client.onLogin();
        return true;
    }
}
