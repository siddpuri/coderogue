if (!getLevel() && randomNumber(0,1)) moveRandomly();
else if (state == 'initial')          moveTowardExit();
else if (state == 'circumnavigate')   circumnavigate();

function moveRandomly() {
    [moveForward, turnRight, turnLeft][randomNumber(0, 2)]();
}

function moveTowardExit() {
    state = 'initial';
    if      (isGood(forward))  moveForward();
    else if (isGood(right))    turnRight();
    else if (isGood(left))     turnLeft();
    else if (isGood(backward)) turnRight();
    else if (!isWallOnLeft())  turnRight();
    else                       circumnavigate();
}

function circumnavigate() {
    state = 'circumnavigate';
    if      (isGood(forward))  moveTowardExit();
    else if (isGood(left))     moveTowardExit();
    else if (canMove(left))    turnLeft();
    else if (canMove(forward)) moveForward();
    else                       turnRight();
}

function isGood(dir) {
    return isWarmer(dir) && canMove(dir);
}

function isWallOnLeft() {
    return isWarmer(left) && !canMove(left);
}

function isWarmer(dir) {
    let dx = getExitPosition()[0] - getPosition()[0];
    let dy = getExitPosition()[1] - getPosition()[1];
    let realDir = (getDirection() + dir) % 4;
    return realDir == 0 && dy < 0 ||
           realDir == 1 && dx > 0 ||
           realDir == 2 && dy > 0 ||
           realDir == 3 && dx < 0;
}
