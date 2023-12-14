import LookupTable from '../components/lookup_table';

const entries = [
    {
        line: 'console.log(val)',
        desc: `Prints \`val\` to the log, which is accessible in the Log pane
              of this page`
    },
    {
        line: 'moveForward()',
        desc: `Moves the player forward one square`
    },
    {
        line: 'turnRight()',
        desc: `Turns the player right 90 degrees`
    },
    {
        line: 'turnLeft()',
        desc: `Turns the player left 90 degrees`
    },
    {
        line: 'canMove(dir)',
        desc: `Returns \`true\` if the player can move in direction \`dir\`
              without touching a wall or another player.

              \`dir\` is an integer where 0 is forward, 1 is right, 2 is
              backward, and 3 is left, **relative to the direction the player
              is facing.** This is the one function that uses relative
              direction in order to stay consistent with College Board's
              Psuedocode language.

              For your convenience, you can use the pre-defined variables
              \`forward\`, \`right\`, \`backward\`, and \`left\`, which are set
              to their corresponding integers.`
    },
    {
        line: 'respawn()',
        desc: `Immediately respawn on level 0`
    },
    {
        line: 'respawnAt(level, pos, dir)',
        desc: `Immediately respawn on level \`level\`, at position \`pos\`,
              facing direction \`dir\`.

              The next time the player exits after calling this function, it
              will yield no points! Similarly, bumping off another player on
              level 2 after respawning yields no points.

              For example: \`respawnAt(1, [10, 9], 2)\` respaws the player on
              level 1, just above the exit and facing downward.`
    },
    {
        line: 'getLevel()',
        desc: `Returns the current level`
    },
    {
        line: 'getDirection()',
        desc: `Returns an integer represting the direciton the player is facing,
              where 0 is up, 1 is right, 2 is down, and 3 is left`
    },
    {
        line: 'getPosition()',
        desc: `Returns a list of length 2 in the form of \`[col, row]\`,
              representing the current position of the player`
    },
    {
        line: 'getStartPosition()',
        desc: `Returns a list of length 2 in the form of \`[col, row]\`,
              representing the position of the spawn point on the current level`
    },
    {
        line: 'getExitPosition()',
        desc: `Returns a list of length 2 in the form of \`[col, row]\`,
              representing the position of the exit that the player is trying to
              reach`
    },
    {
        line: 'whatsAt(pos)',
        desc: `Returns a string of length 1 correponding to what the map is
              showing at \`pos\`.

              For example: \`whatsAt([0, 0])\` always returns \`'#'\`.`
    },
    {
        line: 'isProtected(pos)',
        desc: `Returns whether a player at that position is protected from PVP
              attacks.

              This is always true on levels 0 and 1, and is true on level 2 if
              the position is near spawn or exit.`
    },
    {
        line: 'isWorthPoints(pos)',
        desc: `Returns how many points you would get for bumping off the player
              at that position.

              This returns 0 if there is no player at that position, or if the
              player is protected, or if the player recently called
              \`respawnAt()\`. Using this function can protect you from wasting
              your time hunting respawned players.

              On level 3, this returns 100 for positions with automata, and 200
              for positions with players.`
    },
    {
        line: 'randomNumber(min, max)',
        desc: `Returns a random integer *n*, where \`min\` < *n* < \`max\``
    },
    {
        line: 'appendItem(list, value)',
        desc: `Modifies \`list\` by appending \`value\` at the end`
    },
    {
        line: 'insertItem(list, i, value)',
        desc: `Modifies \`list\` by inserting \`value\` at index \`i\``
    },
    {
        line: 'removeItem(list, i)',
        desc: `Modifies \`list\` by removing the element at index \`i\``
    },
];

export default function ApiTab() {
    return LookupTable({
        name: 'API documentation',
        header: 'Function',
        body: entries,
    });
}
