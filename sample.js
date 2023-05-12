var dx = getExitPosition()[0] - getPosition()[0];
var dy = getExitPosition()[1] - getPosition()[1];
var cd = getDirection();

if (state == 'initial') moveTowardExit();
if (state == 'circumnavigate') {
    circumnavigate();
    if (state == 'initial') moveTowardExit();
}

function moveTowardExit() {
    if      (isGood(forward))  moveForward();
    else if (isGood(right))    turnRight();
    else if (isGood(left))     turnLeft();
    else if (isGood(backward)) turnRight();
    else if (!isWallOnLeft())  turnRight();
    else                       state = 'circumnavigate';
}

function circumnavigate() {
    if      (isGood(forward))  state = 'initial';
    else if (isGood(left))     state = 'initial';
    else if (canMove(left))    turnLeft();
    else if (canMove(forward)) moveForward();
}

function isGood(dir) {
    return isWarmer(dir) && canMove(dir);
}

function isWallOnLeft() {
    return isWarmer(left) && !canMove(left);
}

function isWarmer(dir) {
    let realDir = (cd + dir) % 4;
    return realDir == 0 && dy < 0 ||
           realDir == 1 && dx > 0 ||
           realDir == 2 && dy > 0 ||
           realDir == 3 && dx < 0;
}