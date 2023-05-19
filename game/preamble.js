// Uncomment the next line to see syntax highlighting.
export default class Preamble { static get code() { return `

var _map = getMap();

function whatsAt(pos) {
    let [x, y] = pos;
    return String.fromCharCode(_map[y * 80 + x]);
}

`; }}
