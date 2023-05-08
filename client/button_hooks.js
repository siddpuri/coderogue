export default class ButtonHooks {
    constructor(client) {
        this.client = client;
    }

    start() {
        this.onClick('login', event => this.login(event));
    }

    login(event) {
        event.preventDefault();
        const userid = this.getText('userid');
        const password = this.getText('password');
        console.log(userid, password);
    }

    onClick(id, f) {
        document.getElementById(id).onclick = f;
    }

    getText(id) {
        return document.getElementById(id).value;
    }
}