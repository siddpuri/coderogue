export default class ButtonHooks {
    constructor(client) {
        this.client = client;
    }

    start() {
        this.onClick('login', async event => await this.login(event));
    }

    async login(event) {
        const email = this.getText('email');
        const password = this.getText('password');
        if (!await this.client.credentials.login({ email, password })) {
            this.say('Login failed!', 3);
        }
    }

    onClick(id, f) {
        document.getElementById(id).onclick = f;
    }

    getText(id) {
        return document.getElementById(id).value;
    }

    say(message, level) {
        this.client.display.say(message, level);
    }
}
