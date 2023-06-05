declare var forward: number;
declare var right: number;
declare var backward: number;
declare var left: number;

/** A global variable that you can use to save your state across ticks. Initially set to `"initial"`. */
declare var state: any;

interface Console {
    /** Prints `val` to the log, which is accessible in the Log pane of this page */
    log(val: any): void;
}

declare var console: Console;

/** Moves the player forward one square */
declare function moveForward(): void;

/**Turns the player right `90` degrees */
declare function turnRight(): void;

/** Turns the player left `90` degrees */
declare function turnLeft(): void;

/** Returns `true` if the player can move in direction `dir` without touching a wall or another player.
 * 
 * `dir` is an integer where 0 is forward, 1 is right, 2 is backward, and 3 is left, relative to the direction the player is facing.
 * 
 * For your convenience, you can use the pre-defined variables `forward`, `right`, `backward`, and `left`, which are set to their corresponding integers. */
declare function canMove(dir: number): boolean;

/** Immediately respawn on level 0 */
declare function respawn(): void;

/** Immediately respawn on level `level`, at position `pos`, facing direction `dir`.
 * 
 * The next time the player exits after calling this function, it will yield no points! Similarly, bumping off another player on level 2 after respawning yields no points.
 * 
 * For example: `respawnAt(1, [10, 9], 2)` respaws the player on level 1, just above the exit and facing downward. */
declare function respawnAt(level: number, pos: number[], dir: number): void;

/** Returns the current level */
declare function getLevel(): number;

/** Returns an integer represting the direciton the player is facing, where 0 is up, 1 is right, 2 is down, and 3 is left */
declare function getDirection(): number;

/** Returns a list of length 2 in the form of `[col, row]`, representing the current position of the player */
declare function getPosition(): number[];

/** Returns a list of length 2 in the form of `[col, row]`, representing the position of the spawn point on the current level */
declare function getStartPosition(): number[];

/** Returns a list of length 2 in the form of `[col, row]`, representing the position of the exit that the player is trying to reach */
declare function getExitPosition(): number[];

/** Returns a string of length 1 correponding to what the map is showing at `pos`.
 * 
 * For example: `whatsAt([0, 0])` always returns `'#'`. */
declare function whatsAt(pos: number[]): string;

/** Returns whether a player at that position is protected from PVP attacks.
 * 
 * This is always true on levels 0 and 1, and is true on level 2 if the position is near spawn or exit. */
declare function isProtected(pos: number[]): boolean;

/** Returns how many points you would get for bumping off the player at that position.
 * 
 * This returns 0 if there is no player at that position, or if the player is protected, or if the player recently called `respawnAt()`. Using this function can protect you from wasting your time hunting respawned players.
 * 
 * On level 3, this returns 100 for positions with automata, and 200 for positions with players. */
declare function isWorthPoints(pos: number[]): number

/** Returns a random integer `n`, where `min <= n <= max` */
declare function randomNumber(min: number, max: number): number;

/** Modifies `list` by appending `value` at the end */
declare function appendItem(list: any[], value: any): void;

/** Modifies `list` by inserting `value` at index `i` */
declare function insertItem(list: any[], i: number, value: any): void;

/** Modifies `list` by removing the element at index `i` */
declare function removeItem(list: any[], i: number): void;
