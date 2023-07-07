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

    constructor(serializedMap: number[] | null = null) {
        if (!serializedMap) {
            this.map = new Uint16Array(levelWidth * levelHeight);
            this.map.fill(0);
        } else {
            this.map = Uint16Array.from(serializedMap);
        }
    }

    setWall(pos: Pos): void { this.set(pos, wallBit); }
    setExit(pos: Pos): void { this.set(pos, exitBit); }
    setSpawn(pos: Pos): void { this.set(pos, spawnBit); }
    setPlayerId(pos: Pos, id: number): void { this.setId(pos, playerBit, id); }
    setMobId(pos: Pos, id: number): void { this.setId(pos, mobBit, id); }

    clearWall(pos: Pos): void { this.clear(pos, wallBit); }
    clearExit(pos: Pos): void { this.clear(pos, exitBit); }
    clearSpawn(pos: Pos): void { this.clear(pos, spawnBit); }
    clearPlayer(pos: Pos): void { this.clearId(pos, playerBit); }
    clearMob(pos: Pos): void { this.clearId(pos, mobBit); }

    hasWall(pos: Pos): boolean { return this.get(pos, wallBit); }
    hasExit(pos: Pos): boolean { return this.get(pos, exitBit); }
    hasSpawn(pos: Pos): boolean { return this.get(pos, spawnBit); }
    hasPlayer(pos: Pos): boolean { return this.get(pos, playerBit); }
    getPlayerId(pos: Pos): number | null { return this.getId(pos, playerBit); }
    hasMob(pos: Pos): boolean { return this.get(pos, mobBit); }
    getMobId(pos: Pos): number | null { return this.getId(pos, mobBit); }

    canEnter(pos: Pos): boolean {
        return (
            !this.hasWall(pos) &&
            !this.hasPlayer(pos) &&
            !this.hasMob(pos)
        );
    }

    canSpawn(pos: Pos): boolean {
        return this.canEnter(pos) && !this.hasExit(pos);
    }

    private set(pos: Pos, bit: number): void {
        let mask = 1 << bit;
        this.map[pos[1] * levelWidth + pos[0]] |= mask;
    }

    private clear(pos: Pos, bit: number): void {
        let mask = 1 << bit;
        this.map[pos[1] * levelWidth + pos[0]] &= ~mask;
    }

    private get(pos: Pos, bit: number): boolean {
        let value = this.map[pos[1] * levelWidth + pos[0]];
        return (value & 1 << bit) != 0;
    }

    private setId(pos: Pos, bit: number, id: number): void {
        let mask = 1 << bit | id << idShift;
        this.map[pos[1] * levelWidth + pos[0]] |= mask;
    }

    private clearId(pos: Pos, bit: number): void {
        let mask = 1 << bit | ~0 << idShift;
        this.map[pos[1] * levelWidth + pos[0]] &= ~mask;
    }

    private getId(pos: Pos, bit: number): number | null {
        let value = this.map[pos[1] * levelWidth + pos[0]];
        if (!(value & 1 << bit)) return null;
        return value >> idShift;
    }

    serialize(): number[] {
        return Array.from(this.map);
    }
}
