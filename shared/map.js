const levelWidth = 80;
const levelHeight = 40;

const wallBit = 0;
const exitBit = 1;
const spawnBit = 2;
const playerBit = 3;
const mobBit = 4;
const idShift = 5;

export default class Map {
    constructor(serializedMap = null) {
        if (!serializedMap) {
            this.map = new Uint16Array(levelWidth * levelHeight);
            this.map.fill(0);
        } else {
            this.map = Uint16Array.from(serializedMap);
        }
    }

    setWall(pos) { this.#set(pos, wallBit); }
    setExit(pos) { this.#set(pos, exitBit); }
    setSpawn(pos) { this.#set(pos, spawnBit); }
    setPlayerId(pos, id) { this.#setId(pos, playerBit, id); }
    setMobId(pos, id) { this.#setId(pos, mobBit, id); }

    clearWall(pos) { this.#clear(pos, wallBit); }
    clearExit(pos) { this.#clear(pos, exitBit); }
    clearSpawn(pos) { this.#clear(pos, spawnBit); }
    clearPlayer(pos) { this.#clearId(pos, playerBit); }
    clearMob(pos) { this.#clearId(pos, mobBit); }

    hasWall(pos) { return this.#get(pos, wallBit); }
    hasExit(pos) { return this.#get(pos, exitBit); }
    hasSpawn(pos) { return this.#get(pos, spawnBit); }
    hasPlayer(pos) { return this.#get(pos, playerBit); }
    getPlayerId(pos) { return this.#getId(pos, playerBit); }
    hasMob(pos) { return this.#get(pos, mobBit); }
    getMobId(pos) { return this.#getId(pos, mobBit); }

    canEnter(pos) {
        return (
            !this.hasWall(pos) &&
            !this.getPlayerId(pos) &&
            !this.getMobId(pos)
        );
    }

    canSpawn(pos) {
        return this.canEnter(pos) && !this.hasExit(pos);
    }

    #set(pos, bit) {
        let mask = 1 << bit;
        this.map[pos[1] * levelWidth + pos[0]] |= mask;
    }

    #clear(pos, bit) {
        let mask = 1 << bit;
        this.map[pos[1] * levelWidth + pos[0]] &= ~mask;
    }

    #get(pos, bit) {
        let value = this.map[pos[1] * levelWidth + pos[0]];
        return (value & 1 << bit) != 0;
    }

    #setId(pos, bit, id) {
        let mask = 1 << bit | id << idShift;
        this.map[pos[1] * levelWidth + pos[0]] |= mask;
    }

    #clearId(pos, bit) {
        let mask = 1 << bit | 31 << idShift;
        this.map[pos[1] * levelWidth + pos[0]] &= ~mask;
    }

    #getId(pos, bit) {
        let value = this.map[pos[1] * levelWidth + pos[0]];
        if (!(value & 1 << bit)) return null;
        return value >> idShift;
    }

    serialize() {
        return Array.from(this.map);
    }
}
