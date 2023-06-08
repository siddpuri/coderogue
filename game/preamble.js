export default class Preamble {
    static get code() {
        let preamble = `

var state;
if (state === undefined) state = 'initial';

var forward = 0;
var right = 1;
var backward = 2;
var left = 3;

var _map = null;

function whatsAt(pos) {
    if (!_map) _map = getMap();
    let code = _map[pos[1] * 80 + pos[0]];
    return String.fromCharCode(code?? 35);
}

function moveForward(pos) {
    _moveForward(pos);
    _map = null;
}

function respawnAt(levelNumber, pos, dir) {
    _respawnAt(levelNumber, pos, dir);
    _map = null;
}

function randomNumber(a, b) {
    return Math.floor(Math.random() * (b - a + 1)) + a;
}

function appendItem(l, x) { l.push(x); }
function insertItem(l, i, x) { l.splice(i, 0, x); }
function removeItem(l, i) { l.splice(i, 1); }

        `;
        return preamble.split('\n').join(' ');
    }
}
