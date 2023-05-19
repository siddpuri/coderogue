// Uncomment the next line to see syntax highlighting.
export default class Preamble { static get code() { return `

var _map = getMap();

function whatsAt(pos) {
    let [x, y] = pos;
    let code = _map[y * 80 + x];
    return String.fromCharCode(code?? 35);
}

`; }}
