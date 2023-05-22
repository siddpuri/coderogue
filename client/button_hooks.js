export default class ButtonHooks {
    constructor(client) {
        this.client = client;
    }

    async start() {
        this.onClick('canvas', event => this.handleMapClick(event));
        this.onClick('respawn1', async () => await this.respawn());
        this.onClick('reformat', async () => await this.reformat());
        this.onClick('submit', async () => await this.submit());
        this.onClick('respawn2', async () => await this.respawn());
        this.onClick('freeze', () => this.client.display.toggleFreeze());
        this.onClick('show-all', () => this.client.display.showAll());
        this.onClick('show-latest', () => this.client.display.showLatest());
        this.onClick('show-filtered', () => this.client.display.showFiltered());
        this.onClick('login', async () => await this.login());
        this.onClick('logout', async () => await this.logout());
        document.addEventListener('keydown', async event => await this.handleKey(event));
    }

    handleMapClick(event) {
        this.client.display.highlightTile(event.offsetX, event.offsetY);
    }

    async login() {
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        let result = await this.client.updater.postJson('login', { email, password });
        if (result.error) {
            this.say(result.error, 3);
        } else {
            this.client.credentials.login(result);
            this.say('You have been logged in.', 0);
        }
    }

    async logout() {
        await this.client.credentials.logout();
        this.say('You have been logged out.', 1);
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

    async handleKey(event) {
        if (!event.ctrlKey) return;
        if (event.key == 's') {
            event.preventDefault();
            await this.submit();
        }
        else if (event.key == 'ArrowLeft') {
            this.client.display.switchTab(-1);
        }
        else if (event.key == 'ArrowRight') {
            this.client.display.switchTab(1);
        }
        else if (event.key == 'ArrowUp') {
            if (event.shiftKey) {
                this.client.display.map = this.client.display.newMap;
            } else {
                delete this.client.display.highlightedPlayer;
                this.client.display.levelToRender = Math.min(this.client.display.levelToRender + 1, 2);
            }
        }
        else if (event.key == 'ArrowDown') {
            if (event.shiftKey) {
                this.client.display.map = this.client.display.asciiMap;
            } else {
                delete this.client.display.highlightedPlayer;
                this.client.display.levelToRender = Math.max(this.client.display.levelToRender - 1, 0);
            }
        }
    }

    onClick(id, f) {
        document.getElementById(id).addEventListener('click', f, false);
    }

    say(message, level) {
        this.client.display.say(message, level);
    }
}
