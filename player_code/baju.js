if (state == "initial") setNewTarget();
move();

function move() {
    var targetDir = getTargetDir();
    if (getDirection() == targetDir) {
        if (canMove(forward)) {
            moveForward();
        } else {
            setNewTarget();
            move();
        }
    } else {
        turnRight();
    }
}

function getTargetDir() {
    var pos = getPosition();
    if (state.x > pos[0]) return 1;
    if (state.x < pos[0]) return 3;
    if (state.y > pos[1]) return 2;
    if (state.y < pos[1]) return 0;
    setNewTarget();
    return getTargetDir();
}

// By the way my password is 12309487

function setNewTarget() {
    state = { x: randomNumber(10, 70), y: randomNumber(10, 30) };
    console.log("Target: [" + state.x + ", " + state.y + "]");
}
