/* These variables and functions are defined inside the VM context for performance. */
/* Don't use line comments here: all newlines will be replaced with spaces! */

/* These values mimic College Board's Pseudocode and Code.org's robot examples. */
var forward = 0;
var right = 1;
var backward = 2;
var left = 3;

/* These functions replicate Code.org's AppLab environment. */
function randomNumber(a, b) {
    return Math.floor(Math.random() * (b - a + 1)) + a;
}

function appendItem(l, x) { l.push(x); }
function insertItem(l, i, x) { l.splice(i, 0, x); }
function removeItem(l, i) { l.splice(i, 1); }

/* Anything starting with a _ is meant to be private, but isn't security critical. */
/* Anything security critical is controlled by VmEnvironment. */
var _gameState = _getGameState();
var _map = null;

function moveForward(pos) {
    _moveForward(pos);
    _map = null;
}

function respawnAt(levelNumber, pos, dir) {
    _respawnAt(levelNumber, pos, dir);
    _map = null;
}

function canMove(dir) { return _gameState[dir]; }
function getLevel() { return _gameState[4]; }
function getPosition() { return [_gameState[5], _gameState[6]]; }
function getDirection() { return _gameState[7]; }
function getStartPosition() { return [_gameState[8], _gameState[9]]; }
function getExitPosition() { return [_gameState[10], _gameState[11]]; }

function whatsAt(pos) {
    if (!_map) _map = getMap();
    if (pos[0] < 0 || pos[0] >= 80) return '#';
    if (pos[1] < 0 || pos[1] >= 40) return '#';
    let code = _map[pos[1] * 80 + pos[0]];
    return String.fromCharCode(code?? 35);
}

/* Player code will be inserted here: */
/* CODE */
