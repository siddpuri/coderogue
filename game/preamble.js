export default class Preamble {
    static get code() {
        let preamble = `

var _map = null;

function whatsAt(pos) {
    if (!_map || getLevel() != _map.level) {
        _map = getMap();
        _map.level = getLevel();
    }
    let [x, y] = pos;
    let code = _map[y * 80 + x];
    return String.fromCharCode(code?? 35);
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
