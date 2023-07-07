import { LoginResponse } from '../shared/protocol.js';

import Client from './client.js';
import Fetcher from './fetcher.js';

export default class ButtonHooks {
    private fetcher: Fetcher;

    constructor(
        private readonly client: Client
    ) {
        this.fetcher = new Fetcher(client);
    }

    async start(): Promise<void> {
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

    private element(id: string): HTMLElement {
        return document.getElementById(id) as HTMLElement;
    }

    private getText(id: string): string {
        let textField = this.element(id) as HTMLInputElement;
        return textField.value;
    }

    private handleMouseMove(event: MouseEvent): void {
        this.client.display.onMouseMove(event.offsetX, event.offsetY);
    }

    private handleMapClick(event: MouseEvent): void {
        this.client.display.highlightTile(event.offsetX, event.offsetY);
    }

    private async login(): Promise<void> {
        const email = this.getText('email');
        const password = this.getText('password');
        let result = await this.fetcher.postJson<LoginResponse>('login', { email, password });
        if (result) {
            this.client.credentials.onLogin(result);
            this.client.display.say('You have been logged in.', 0);
        }
    }

    private async logout(): Promise<void> {
        await this.client.credentials.onLogout();
        this.client.display.say('You have been logged out.', 1);
    }

    private async respawn(): Promise<void> {
        let result = await this.fetcher.postJson('respawn');
    }

    private async reformat(): Promise<void> {
        this.client.editor.reformat();
    }

    private async submit(): Promise<void> {
        let code = this.client.display.getCode();
        let result = await this.fetcher.postJson('code', { code });
        if (result) this.client.display.say('Code submitted!', 0);
    }

    private async handleKey(event: KeyboardEvent): Promise<void> {
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

    private onClick(id: string, f: (event: MouseEvent) => void): void {
        this.element(id).addEventListener('click', f, false);
    }
}
