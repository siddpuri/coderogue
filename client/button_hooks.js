export default class ButtonHooks {
    constructor(client) {
        this.client = client;
    }

    start() {
        this.onClick('login', async event => await this.login(event));
    }

    async login(event) {
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        if (!await this.client.credentials.login({ email, password })) {
            this.say('Login failed!', 3);
        }
    }

    onClick(id, f) {
        document.getElementById(id).onclick = f;
    }

    say(message, level) {
        this.client.display.say(message, level);
    }
}
