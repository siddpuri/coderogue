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

        `;
        return preamble.split('\n').join(' ');
    }
}
