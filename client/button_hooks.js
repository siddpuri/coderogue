export default class ButtonHooks {
    constructor(client) {
        this.client = client;
    }

    start() {
        this.onClick('canvas', event => this.handleMapClick(event));
        this.onClick('login', async event => await this.login(event));
        this.onClick('logout', async event => await this.logout(event));
        this.onClick('submit', async event => await this.submit(event));
    }

    handleMapClick(event) {
        this.client.display.highlightTile(event.offsetX, event.offsetY);
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

    async submit(event) {
        let code = this.client.display.getCode();
        let response = await fetch(
            this.client.baseUrl + '/api/code',
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ code }),
            }
        );
        let result = await response.json();
        if (result.error) {
            this.say(result.error, 3);
        }
        else {
            this.say('Code submitted!', 0);
        }
    }

    onClick(id, f) {
        document.getElementById(id).onclick = f;
    }

    say(message, level) {
        this.client.display.say(message, level);
    }
}
