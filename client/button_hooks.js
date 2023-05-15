export default class ButtonHooks {
    constructor(client) {
        this.client = client;
    }

    async start() {
        this.onClick('canvas', event => this.handleMapClick(event));
        this.onClick('login', async () => await this.login());
        this.onClick('logout', async () => await this.logout());
        this.onClick('respawn', async () => await this.respawn());
        this.onClick('reformat', async () => await this.reformat());
        this.onClick('submit', async () => await this.submit());
        this.onClick('show-all', () => this.client.display.showAll());
        this.onClick('show-latest', () => this.client.display.showLatest());
        this.onClick('show-filtered', () => this.client.display.showFiltered());
    }

    handleMapClick(event) {
        this.client.display.highlightTile(event.offsetX, event.offsetY);
    }

    async login() {
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        if (!await this.client.credentials.login({ email, password })) {
            this.say('Login failed!', 3);
        }
    }

    async logout() {
        await this.client.credentials.logout();
    }

    async respawn() {
        let result = await this.client.updater.postJson('respawn', {});
        if (result.error) {
            this.say(result.error, 3);
        }
    }

    async reformat() {
        let code = this.client.display.getCode();
        let cursor = this.client.display.getCodeCursor();
        let result = prettier.formatWithCursor(code, {
            cursorOffset: cursor,
            parser: 'babel',
            plugins: prettierPlugins,
        });
        this.client.display.setCode(result.formatted);
        this.client.display.setCodeCursor(result.cursorOffset);
    }

    async submit() {
        let code = this.client.display.getCode();
        let result = this.client.updater.postJson('code', { code });
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
