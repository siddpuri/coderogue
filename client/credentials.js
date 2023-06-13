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
            this[name] = (name === 'playerId')? Number(value) : value;
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
        this.textHandle = serverResponse.textHandle;
        this.writeCookie('playerId', this.playerId);
        this.writeCookie('authToken', this.authToken);
        this.writeCookie('textHandle', this.textHandle);
        this.client.onLogin();
        return true;
    }

    async logout() {
        delete this.authToken;
        delete this.playerId;
        delete this.textHandle;
        this.deleteCookie('playerId');
        this.deleteCookie('authToken');
        this.deleteCookie('textHandle');
        this.client.onLogout();
    }
}
