const headers = {
    'Content-Type': 'application/json',
}

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
        let response = await fetch(
            this.client.baseUrl + "/api/login",
            {
                method: 'POST',
                headers: headers,
                body: JSON.stringify({ email, password }),
            }
        );
        let result = await response.json();
        console.log(result);
    }

    onClick(id, f) {
        document.getElementById(id).onclick = f;
    }

    getText(id) {
        return document.getElementById(id).value;
    }
}