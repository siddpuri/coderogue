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
            this.toast('loginfailure');
        }
    }

    onClick(id, f) {
        document.getElementById(id).onclick = f;
    }

    getText(id) {
        return document.getElementById(id).value;
    }

    toast(id) {
        const e = document.getElementById(id);
        e.classList.remove('invisible');
        e.classList.add('show');
        setTimeout(() => {
            e.classList.remove('show');
            e.classList.add('fade');
            setTimeout(() => {
                e.classList.remove('show');
                e.classList.remove('fade');
                e.classList.add('invisible');
            }, 3000);
        }, 500);
    }
}
