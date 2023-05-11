var dx = getExitPosition()[0] - getPosition()[0];
var dy = getExitPosition()[1] - getPosition()[1];
var cd = getDirection();

function goodDirection(dir) {
    let realDir = (cd + dir) % 4;
    let warmer =
        realDir == 0 && dy < 0 ||
        realDir == 1 && dx > 0 ||
        realDir == 2 && dy > 0 ||
        realDir == 3 && dx < 0;
    return warmer && canMove(dir);
}

if      (goodDirection(forward)) moveForward();
else if (goodDirection(right)) turnRight();
else if (goodDirection(left)) turnLeft();
else if (goodDirection(backward)) turnRight();
else if (canMove(forward)) moveForward();
else if (canMove(right)) turnRight();
else if (canMove(left)) turnLeft();
else if (canMove(backward)) turnRight();
else respawn();
