// Actions
var none    = 0;
var forward = 1;
var left    = 2;
var right   = 3;

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

search();

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
    while (true) {
        if (table.head == table.tail) break;
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
    [giveUp, moveForward, turnLeft, turnRight][a]();
}

function visit(y, x, dir, a) {
    let i = pack(y, x, dir);
    if (table.getAction(i)) return;
    table.setAction(i, a);
    enqueue(i);
}

function isBlocked(y, x) {
    let char = whatsAt([x, y]);
    if (char == '#') return true;
    if (!'^>v<'.includes(char)) return false;
    if (x == x0 && y == y0) return false;
    if (level0 <= 2) return true;
    return x < 16 && y < 16 || x > 64 && y > 24;
}

function giveUp() {
    console.log('No path found!');
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

// dumpTable(dir0);
