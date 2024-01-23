var startTime = Date.now();
var shouldDump = false;
var shouldTime = false;

if (state == 'initial') state = { idle: 0 };

// Constants: actions
var none    = 0;
var forward = 1;
var left    = 2;
var right   = 3;

// Constants: pvp
var pvpRadius = 2;
var pvpSize   = 2 * pvpRadius + 1;
var pvpDepth  = 3;

// Lookup table
var table;
if (!table) {
    table = new Uint16Array(80 * 40 * 4);
    table.getAction =  i     => table[i] & 3;
    table.setAction = (i, a) => table[i] |= a;
    table.getNext   =  i     => table[i] >> 2;
    table.setNext   = (i, n) => table[i] |= n << 2;
} else {
    table.fill(0);
}
table.head = 0;
table.tail = 0;

// Main function
var level0 = getLevel();
var dir0 = getDirection();
var [x0, y0] = getPosition();
var [x1, y1] = getExitPosition();

state.idle++;
if (level0 == 2 && state.idle >= 4) {
    moveForwardMaybe();
}
else search();

// Index calculations
function pack(y, x, dir) {
    return (y * 80 + x) * 4 + dir;
}

function unpack(i) {
    let dir = i & 3;
    i >>= 2;
    let x = i % 80;
    i /= 80;
    let y = i |0;
    return [y, x, dir];
}

// Queue
function enqueue(i) {
    table.setNext(table.tail, i);
    table.tail = i;
}

function dequeue() {
    return table.head = table.getNext(table.head);
}

// Search
function search() {
    for (let dir = 0; dir < 4; dir++) {
        visit(y1, x1, dir, forward);
    }
    while (table.head != table.tail) {
        let [y, x, dir] = unpack(dequeue());
        if (y == y0 && x == x0 && dir == dir0) break;
        visit(y, x, (dir + 1) % 4, left);
        visit(y, x, (dir + 3) % 4, right);
        let [dy, dx] = [[1, 0], [0, -1], [-1, 0], [0, 1]][dir];
        if (!isBlocked(y + dy, x + dx)) {
            visit(y + dy, x + dx, dir, forward);
        }
    }
    let a = table.getAction(pack(y0, x0, dir0));
    [giveUp, moveForwardMaybe, turnLeft, turnRight][a]();
}

function visit(y, x, dir, a) {
    let i = pack(y, x, dir);
    if (table.getAction(i)) return;
    table.setAction(i, a);
    enqueue(i);
}

function isBlocked(y, x) {
    let pos = [x, y];
    let char = whatsAt(pos);
    if (char == '#') return true;
    if (!isMob(pos)) return false;
    if (x == x0 && y == y0) return false;
    if (Math.abs(x - x0) + Math.abs(y - y0) > 5) return false;
    return isProtected(pos);
}

function giveUp() {
    console.log('No path found!');
    moveForwardMaybe();
}

function moveForwardMaybe() {
    let newPos = movePos([x0, y0], dir0);
    if (whatsAt(newPos) == '#') {
        turnRight();
        return;
    }
    if (!isProtected(newPos)) {
        for (let dir of [3, 0, 1]) {
            let enemyPos = movePos(newPos, (dir0 + dir) % 4);
            if (isMob(enemyPos)) {
                let [ex, ey] = movePos(enemyPos, dirAt(enemyPos));
                if (ex == newPos[0] && ey == newPos[1]) return;
            }
        }
    }
    moveForward();
    state.idle = 0;
}

// PVP game
let pvpDepth = 4;

function getPvpStyle() {
    let canDie = false;
    let canKill = false;
    for (let dx = -pvpRadius; dx <= pvpRadius; dx++) {
        for (let dy = -pvpRadius; dy <= pvpRadius; dy++) {
            let pos = [x0 + dx, y0 + dy];
            if (isMob(pos)) {
                if (dx == 0 && dy == 0) continue;
                canDie ||= !isProtected([x0, y0]);
                canKill ||= !isProtected(pos);
            }
        }
    }
    return canKill? 'hunt': canDie? 'run': none;
}

function getPvpAction(style) {
    let state = getPvpState(style);
    let bestScore = -Infinity;
    let bestActions = [];
    for (let action of [none, forward, left, right]) {
        let score = evaluateAction(state, action, pvpDepth, 1);
        if (score != none && score > bestScore) {
            bestScore = score;
            bestActions = [action];
        } else if (score == bestScore) {
            bestActions.push(action);
        }
    }
    return bestActions[randomNumber(0, bestActions.length - 1)];
}

function getPvpState(style) {
    let grid = [];
    let mobs = [[2, 2, 'self']];
    for (let dx = -pvpRadius; dx <= pvpRadius; dx++) {
        let row = [];
        for (let dy = -pvpRadius; dy <= pvpRadius; dy++) {
            let pos = [x0 + dx, y0 + dy];
            row.push(whatsAt(pos));
            if (dirAt(pos) >= 0) {
                if (dx == 0 && dy == 0) continue;
                mobs.push([dx + pvpRadius, dy + pvpRadius]);
            }
        }
        grid.push(row);
    }
    let score = 0;
    return { style, grid, mobs, score };
}

function evaluateAction(state, action, depth, flip) {
    let newState = applyAction(state, action);
    if (newState.style == 'error') return none;
    if (depth == 0 || newState.style == 'done') return newState.score;
    let bestScore = -Infinity * flip;
    for (let action of [none, forward, left, right]) {
        let score = evaluateAction(newState, action, depth - 1, -flip);
        if (score != none && score * flip > bestScore * flip) {
            bestScore = score;
        }
    }
    return bestScore;
}

function applyAction(state, action) {
    switch (action) {
        case none: return state;
        case forward: return applyForwardAction(state);
        case left: return applyTurnAction(state, 3);
        case right: return applyTurnAction(state, 1);
    }
}

function applyForwardAction(state) {
    let mob = state.mobs[0];
    let mobDir = '^>v<'.indexOf(state.grid[mob[0]][mob[1]]);
    let newPos = movePos(mob, mobDir);
    let char = state.grid[newPos[0]][newPos[1]];
    if (!char) return applyWalkOff(state);
    if (char == '#') return { ...state, style: 'error' };
    if ('^>v<'.includes(char)) return applyBump(state, newPos);
    return applyMove(state, newPos);
}

function applyWalkOff(state) {
    let state = copyState(state);
    let mob = state.mobs.shift();
    state.grid[mob[0]][mob[1]] = ' ';
    if (mob[2] || state.mobs.length < 2) state.style = 'done';
    return state;
}

function applyBump(state, newPos) {
    if (state.mobs[0][2] && state.style == 'run') {
        return { ...state, style: 'error' };
    }
    let target = state.mobs.findIndex(
        mob => mob[0] == newPos[0] && mob[1] == newPos[1]
    );
    if (state.mobs[target][2]) {
        return { ...state, style: 'done', score: -Infinity };
    }
    let state = copyState(state);
    state.mobs = state.mobs.splice(target, 1);
    let mob = state.mobs.shift();
    state.grid[newPos[0]][newPos[1]] = ' ';
    state.mobs.push(mob);
    if (mob[2]) state.score++;
    if (state.mobs.length == 1) state.style = 'done';
    return state;
}

function applyMove(state, newPos) {
    let state = copyState(state);
    let mob = state.mobs.shift();
    state.grid[newPos[0]][newPos[1]] = grid[mob[0]][mob[1]];
    state.grid[mob[0]][mob[1]] = ' ';
    state.mobs.push(newPos);
    return state;
}

function applyTurnAction(state, dir) {
    let state = copyState(state);
    let mob = state.mobs.shift();
    let mobDir = '^>v<'.indexOf(state.grid[mob[0]][mob[1]]);
    state.grid[mob[0]][mob[1]] = '^>v<'[(mobDir + dir) % 4];
    state.mobs.push(mob);
    return state;
}

function copyState(state) {
    return {
        ...state,
        grid: state.grid.map(x => [...x]),
        mobs: state.mobs.map(x => [...x]),
    };
}

// General helper functions
function movePos(pos, dir) {
    let d = [[0, -1], [1, 0], [0, 1], [-1, 0]][dir];
    let newPos = pos.slice();
    newPos[0] += d[0];
    newPos[1] += d[1];
    return newPos;
}

function dirAt(pos) {
    return '^>v<'.indexOf(whatsAt(pos));
}

function isMob(pos) {
    return dirAt(pos) >= 0;
}

function dumpTable(dir) {
    for (let y = 39; y >= 0; y--) {
        let line = '';
        for (let x = 0; x < 80; x++) {
            let a = table.getAction(pack(y, x, dir));
            line += ' .<>'[a];
        }
        console.log(line);
    }
}

if (shouldDump) dumpTable(dir0);
if (shouldTime) {
    console.log(`Executed in ${Date.now() - startTime}ms.`);
}
