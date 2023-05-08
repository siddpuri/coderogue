export default class Credentials {
    constructor(client) {
        this.client = client;
        this.authToken = undefined;
    }

    async login(credentials) {
        let response = await fetch(
            this.client.baseUrl + '/api/login',
            {
                method: 'POST',
                headers: headers,
                body: JSON.stringify(credentials),
            }
        );
        let result = await response.json();
        if (result.error) {
            return false;
        }
        this.authToken = result.authToken;
        return true;
    }
}
