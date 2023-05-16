// Constants
var none = 0;
var forward = 1;
var left = 2;
var right = 3;

// Lookup table
var table;
if (!table) table = new Uint16Array(80 * 40 * 4);

function clearMoves() {
    table.fill(0);
}

// Index calculations
function index(y, x, dir) {
    return (y * 80 + x) * 4 + dir;
}

function yOf(i) {
    let pos = i / 4 |0;
    return pos / 80 |0;
}

function xOf(i) {
    let pos = i / 4 |0;
    return pos % 80;
}

function dirOf(i) {
    return i & 3;
}

// Queue
var head;
var tail;

function enqueue(i) {
    table[tail] ||= i << 2;
    tail = i;
}

function dequeue() {
    let result = head;
    head = table[head] >> 2;
    return result;
}

function isEmpty() {
    return !head;
}

// Pathfinding
function expand()