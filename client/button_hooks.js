export default class ButtonHooks {
    constructor(client) {
        this.client = client;
    }

    start() {
        this.onClick('login', async event => await this.login(event));
        this.onClick('logout', async event => await this.logout(event));
    }

    async login(event) {
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        if (!await this.client.credentials.login({ email, password })) {
            this.say('Login failed!', 3);
        }
    }

    async logout(event) {
        await this.client.credentials.logout();
    }

    onClick(id, f) {
        document.getElementById(id).onclick = f;
    }

    say(message, level) {
        this.client.display.say(message, level);
    }
}
