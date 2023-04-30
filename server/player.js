export default class Player {
    constructor(id, name, period, handle) {
        this.id = id;
        this.name = name;
        this.period = period;
        this.handle = handle.toString();
    }
}