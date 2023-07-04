import { LoginResponse, CodeResponse, ErrorResponse } from '../shared/protocol.js';

import Client from './client.js';

export default class ButtonHooks {
    constructor(
        private readonly client: Client
    ) {}

    async start() {
        this.onClick('prev-level', () => this.client.display.switchLevel(-1));
        this.onClick('next-level', () => this.client.display.switchLevel(1));
        this.onClick('first-players', () => this.client.display.showPlayers(0));
        this.onClick('prev-players', () => this.client.display.showPlayers(-1));
        this.onClick('next-players', () => this.client.display.showPlayers(1));
        this.onClick('canvas', this.handleMapClick.bind(this));
        this.onClick('find-handle', () => this.client.display.findHandle());
        this.onClick('respawn1', this.respawn.bind(this));
        this.onClick('reformat', this.reformat.bind(this));
        this.onClick('submit', this.submit.bind(this));
        this.onClick('respawn2', this.respawn.bind(this));
        this.onClick('freeze', () => this.client.display.toggleFreeze());
        this.onClick('show-all', () => this.client.display.showAll());
        this.onClick('show-latest', () => this.client.display.showLatest());
        this.onClick('show-filtered', () => this.client.display.showFiltered());
        this.onClick('login', this.login.bind(this));
        this.onClick('logout', this.logout.bind(this));

        let canvas = this.element('canvas');
        canvas.addEventListener('mouseenter', () => this.client.display.onMouseEnter());
        canvas.addEventListener('mousemove', this.handleMouseMove.bind(this));
        canvas.addEventListener('mouseleave', () => this.client.display.onMouseLeave());

        document.addEventListener('keydown', this.handleKey.bind(this));
        this.element('handle').addEventListener('keydown', event => {
            if (event.key == 'Enter') this.client.display.findHandle();
        });
    }

    private element(id: string) {
        return document.getElementById(id) as HTMLElement;
    }

    private getText(id: string) {
        let textField = this.element(id) as HTMLInputElement;
        return textField.value;
    }

    private handleMouseMove(event: MouseEvent) {
        this.client.display.onMouseMove(event.offsetX, event.offsetY);
    }

    private handleMapClick(event: MouseEvent) {
        this.client.display.highlightTile(event.offsetX, event.offsetY);
    }

    private async login() {
        const email = this.getText('email');
        const password = this.getText('password');
        let result: LoginResponse | ErrorResponse = await this.client.updater.postJson('login', { email, password });
        if ((result as ErrorResponse).error) {
            this.say((result as ErrorResponse).error, 3);
        } else {
            this.client.credentials.onLogin(result as LoginResponse);
            this.say('You have been logged in.', 0);
        }
    }

    private async logout() {
        await this.client.credentials.onLogout();
        this.say('You have been logged out.', 1);
    }

    private async respawn() {
        let result = await this.client.updater.postJson('respawn', {});
        if (result.error) {
            this.say(result.error, 3);
        }
    }

    private async reformat() {
        this.client.editor.reformat();
    }

    private async submit() {
        let code = this.client.display.getCode();
        let result: CodeResponse | ErrorResponse = await this.client.updater.postJson('code', { code });
        if ((result as ErrorResponse).error) {
            this.say((result as ErrorResponse).error, 3);
        }
        else {
            this.say('Code submitted!', 0);
        }
    }

    private async handleKey(event: KeyboardEvent) {
        let key =
            (event.ctrlKey? 'C-' : '') +
            (event.shiftKey? 'S-' : '') +
            event.key;
        switch (key) {
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
                this.client.display.map.setStyle(1); break;
            case 'C-S-ArrowDown':
                this.client.display.map.setStyle(0); break;
        }
    }

    private onClick(id: string, f: (event: MouseEvent) => void) {
        this.element(id).addEventListener('click', f, false);
    }

    say(message: string, level: number) {
        this.client.display.say(message, level);
    }
}
