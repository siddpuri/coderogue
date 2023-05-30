// Uncomment the next line to see syntax highlighting.
export default class Preamble { static get code() { return `

var _map;

function whatsAt(pos) {
    if (!_map || getLevel() != _map.level) {
        _map = getMap();
        _map.level = getLevel();
    }
    let [x, y] = pos;
    let code = _map[y * 80 + x];
    return String.fromCharCode(code?? 35);
}

`; }}
