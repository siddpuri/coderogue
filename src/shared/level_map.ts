const levelWidth = 80;
const levelHeight = 40;

const wallBit = 0;
const exitBit = 1;
const spawnBit = 2;
const playerBit = 3;
const mobBit = 4;
const idShift = 5;

type Pos = [number, number];

export default class LevelMap {
    private readonly map: Uint16Array;

    constructor(serializedMap: Uint16Array | null = null) {
        if (!serializedMap) {
            this.map = new Uint16Array(levelWidth * levelHeight);
            this.map.fill(0);
        } else {
            this.map = Uint16Array.from(serializedMap);
        }
    }

    setWall(pos: Pos) { this.set(pos, wallBit); }
    setExit(pos: Pos) { this.set(pos, exitBit); }
    setSpawn(pos: Pos) { this.set(pos, spawnBit); }
    setPlayerId(pos: Pos, id: number) { this.setId(pos, playerBit, id); }
    setMobId(pos: Pos, id: number) { this.setId(pos, mobBit, id); }

    clearWall(pos: Pos) { this.clear(pos, wallBit); }
    clearExit(pos: Pos) { this.clear(pos, exitBit); }
    clearSpawn(pos: Pos) { this.clear(pos, spawnBit); }
    clearPlayer(pos: Pos) { this.clearId(pos, playerBit); }
    clearMob(pos: Pos) { this.clearId(pos, mobBit); }

    hasWall(pos: Pos) { return this.get(pos, wallBit); }
    hasExit(pos: Pos) { return this.get(pos, exitBit); }
    hasSpawn(pos: Pos) { return this.get(pos, spawnBit); }
    hasPlayer(pos: Pos) { return this.get(pos, playerBit); }
    getPlayerId(pos: Pos) { return this.getId(pos, playerBit); }
    hasMob(pos: Pos) { return this.get(pos, mobBit); }
    getMobId(pos: Pos) { return this.getId(pos, mobBit); }

    canEnter(pos: Pos) {
        return (
            !this.hasWall(pos) &&
            !this.hasPlayer(pos) &&
            !this.hasMob(pos)
        );
    }

    canSpawn(pos: Pos) {
        return this.canEnter(pos) && !this.hasExit(pos);
    }

    private set(pos: Pos, bit: number) {
        let mask = 1 << bit;
        this.map[pos[1] * levelWidth + pos[0]] |= mask;
    }

    private clear(pos: Pos, bit: number) {
        let mask = 1 << bit;
        this.map[pos[1] * levelWidth + pos[0]] &= ~mask;
    }

    private get(pos: Pos, bit: number) {
        let value = this.map[pos[1] * levelWidth + pos[0]];
        return (value & 1 << bit) != 0;
    }

    private setId(pos: Pos, bit: number, id: number) {
        let mask = 1 << bit | id << idShift;
        this.map[pos[1] * levelWidth + pos[0]] |= mask;
    }

    private clearId(pos: Pos, bit: number) {
        let mask = 1 << bit | ~0 << idShift;
        this.map[pos[1] * levelWidth + pos[0]] &= ~mask;
    }

    private getId(pos: Pos, bit: number) {
        let value = this.map[pos[1] * levelWidth + pos[0]];
        if (!(value & 1 << bit)) return null;
        return value >> idShift;
    }

    serialize() {
        return Array.from(this.map);
    }
}
