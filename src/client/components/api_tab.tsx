import Markdown from 'react-markdown'

const entries = [
    {
        code: 'console.log(val)',
        desc: `Prints \`val\` to the log, which is accessible in the Log pane
              of this page`
    },
    {
        code: 'moveForward()',
        desc: `Moves the player forward one square`
    },
    {
        code: 'turnRight()',
        desc: `Turns the player right 90 degrees`
    },
    {
        code: 'turnLeft()',
        desc: `Turns the player left 90 degrees`
    },
    {
        code: 'canMove(dir)',
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
        code: 'respawn()',
        desc: `Immediately respawn on level 0`
    },
    {
        code: 'respawnAt(level, pos, dir)',
        desc: `Immediately respawn on level \`level\`, at position \`pos\`,
              facing direction \`dir\`.

              The next time the player exits after calling this function, it
              will yield no points! Similarly, bumping off another player on
              level 2 after respawning yields no points.

              For example: \`respawnAt(1, [10, 9], 2)\` respaws the player on
              level 1, just above the exit and facing downward.`
    },
    {
        code: 'getLevel()',
        desc: `Returns the current level`
    },
    {
        code: 'getDirection()',
        desc: `Returns an integer represting the direciton the player is facing,
              where 0 is up, 1 is right, 2 is down, and 3 is left`
    },
    {
        code: 'getPosition()',
        desc: `Returns a list of length 2 in the form of \`[col, row]\`,
              representing the current position of the player`
    },
    {
        code: 'getStartPosition()',
        desc: `Returns a list of length 2 in the form of \`[col, row]\`,
              representing the position of the spawn point on the current level`
    },
    {
        code: 'getExitPosition()',
        desc: `Returns a list of length 2 in the form of \`[col, row]\`,
              representing the position of the exit that the player is trying to
              reach`
    },
    {
        code: 'whatsAt(pos)',
        desc: `Returns a string of length 1 correponding to what the map is
              showing at \`pos\`.

              For example: \`whatsAt([0, 0])\` always returns \`'#'\`.`
    },
    {
        code: 'isProtected(pos)',
        desc: `Returns whether a player at that position is protected from PVP
              attacks.

              This is always true on levels 0 and 1, and is true on level 2 if
              the position is near spawn or exit.`
    },
    {
        code: 'isWorthPoints(pos)',
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
        code: 'randomNumber(min, max)',
        desc: `Returns a random integer *n*, where \`min\` < *n* < \`max\``
    },
    {
        code: 'appendItem(list, value)',
        desc: `Modifies \`list\` by appending \`value\` at the end`
    },
    {
        code: 'insertItem(list, i, value)',
        desc: `Modifies \`list\` by inserting \`value\` at index \`i\``
    },
    {
        code: 'removeItem(list, i)',
        desc: `Modifies \`list\` by removing the element at index \`i\``
    },
];

export default function ApiTab() {
    return <>
        <h5>API documentation</h5>
        <table className="table">
            <thead>
                <tr>
                    <th className="col-3">Function</th>
                    <th>Description</th>
                </tr>
            </thead>
            <tbody>
                {entries.map(({ code, desc }) =>
                    <tr key={code}>
                        <td><code>{code}</code></td>
                        <td><Markdown>{desc.replace(/^ */gm, '')}</Markdown></td>
                    </tr>
                )}
            </tbody>
        </table>
    </>;
}
