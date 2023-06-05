import MonacoEditor from './monaco_editor.js';

export default class ButtonHooks {
    constructor(client) {
        this.client = client;
    }

    async start() {
        this.onClick('prev-level', () => this.client.display.switchLevel(-1));
        this.onClick('next-level', () => this.client.display.switchLevel(1));
        this.onClick('first-players', () => this.client.display.showPlayers(0));
        this.onClick('prev-players', () => this.client.display.showPlayers(-1));
        this.onClick('next-players', () => this.client.display.showPlayers(1));
        this.onClick('canvas', event => this.handleMapClick(event));
        this.onClick('find-handle', () => this.client.display.findHandle());
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

        let canvas = document.getElementById('canvas');
        canvas.addEventListener('mouseenter', () => this.client.display.onMouseEnter());
        canvas.addEventListener('mousemove', event => this.handleMouseMove(event));
        canvas.addEventListener('mouseleave', () => this.client.display.onMouseLeave());

        document.getElementById('handle').addEventListener('keydown', event => {
            if (event.key == 'Enter') this.client.display.findHandle();
        });
        document.addEventListener('keydown', async event => await this.handleKey(event));
    }

    handleMouseMove(event) {
        this.client.display.onMouseMove(event.offsetX, event.offsetY);
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
        MonacoEditor.instance().getAction("editor.action.formatDocument").run();
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
        let key =
            (event.ctrlKey? 'C-' : '') +
            (event.shiftKey? 'S-' : '') +
            event.key;
        switch (key) {
            case 'Tab':
                if (event.target.id == 'code-text') {
                    event.preventDefault();
                    document.execCommand('insertText', true, '  ');
                }
                break;
            case 'C-s':
                event.preventDefault();
                await this.submit();
                break;
            case 'C-[':
                this.client.display.switchTab(-1); break;
            case 'C-]':
                this.client.display.switchTab(1); break;
            case 'C-ArrowUp':
                this.client.display.switchLevel(1); break;
            case 'C-ArrowDown':
                this.client.display.switchLevel(-1); break;
            case 'C-S-ArrowUp':
                this.client.display.switchMap(1); break;
            case 'C-S-ArrowDown':
                this.client.display.switchMap(-1); break;
        }
    }

    onClick(id, f) {
        document.getElementById(id).addEventListener('click', f, false);
    }

    say(message, level) {
        this.client.display.say(message, level);
    }
}
