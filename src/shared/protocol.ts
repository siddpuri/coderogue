export type LoginRequest  = {
    email: string;
    password: string;
};

export type LoginResponse = {
    playerId: number;
    authToken: string;
    textHandle: string;
}

export type StateResponse = {
    players: (PlayerData | undefined)[];
    levels: LevelData[];
}

export type PlayerData = {
    id: number;
    handle: number;
    levelNumber: number;
    pos: [number, number];
    dir: number;
    idle: number;
    offenses: number;
    jailtime: number;
    chartData: number[];
    timeSpent: number[];
    timesCompleted: number[];
    kills: number[];
    deaths: number[];
    score: number[];
}

export type LevelData = {
    name: string;
    map: number[];
    mobs: MobData[];
}

export type MobData = {
    dir: number;
    textHandle: string;
}

export type ErrorResponse = {
    error: string;
}
