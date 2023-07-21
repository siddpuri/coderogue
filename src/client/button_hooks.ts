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
        let display = this.client.display;
        let canvas = this.element('canvas');

        this.onClick('prev-level', () => display.switchLevel(-1));
        this.onClick('next-level', () => display.switchLevel(1));
        this.onClick('first-players', () => display.showPlayers(0));
        this.onClick('prev-players', () => display.showPlayers(-1));
        this.onClick('next-players', () => display.showPlayers(1));
        this.onClick('find-handle', () => display.findHandle(), 'handle');
        this.onClick('respawn1', this.respawn.bind(this));
        this.onClick('reformat', this.reformat.bind(this));
        this.onClick('submit', this.submit.bind(this));
        this.onClick('respawn2', this.respawn.bind(this));
        this.onClick('freeze', () => display.toggleFreeze());
        this.onClick('show-all', () => display.showAll());
        this.onClick('show-latest', () => display.showLatest());
        this.onClick('show-filtered', () => display.showFiltered());
        this.onClick('login', this.login.bind(this), 'password');
        this.onClick('logout', this.logout.bind(this));

        canvas.addEventListener('mouseenter', () => display.onMouseEnter());
        canvas.addEventListener('mousemove', event => display.onMouseMove(event));
        canvas.addEventListener('mouseleave', () => display.onMouseLeave());
        canvas.addEventListener('click', event => display.highlightTile(event));

        document.addEventListener('keydown', this.handleKey.bind(this));
    }

    private element(id: string): HTMLElement {
        return document.getElementById(id) as HTMLElement;
    }

    private getText(id: string): string {
        let textField = this.element(id) as HTMLInputElement;
        return textField.value;
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
        await this.fetcher.postJson('respawn');
    }

    private async reformat(): Promise<void> {
        // this.client.editor.reformat();
    }

    async submit(): Promise<void> {
        let code = this.client.display.getCode();
        let result = await this.fetcher.postJson('code', { code });
        if (result) this.client.display.say('Code submitted!', 0);
    }

    private handleKey(event: KeyboardEvent): void {
        let key = event.key;
        if (event.shiftKey) key = 'S-' + key;
        if (event.ctrlKey) key = 'C-' + key;
        let f = this.client.display.keybindings[key];
        if (f) {
            f();
            event.preventDefault();
        }
    }

    private onClick(id: string, f: () => void, orEnter = ''): void {
        this.element(id).addEventListener('click', f);
        if (orEnter) {
            this.element(orEnter).addEventListener('keydown', event => {
                if (event.key == 'Enter') f();
            });
        }
    }
}
