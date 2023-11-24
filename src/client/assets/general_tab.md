#### Welcome to Coderogue!

Coderogue is an online, multiplayer, roguelike game in
which the only way to control your character (or "robot")
is by writing Javascript code.

Start off by creating an account, or logging in if you
already have one. In the "Account" tab, you'll see your
gamer handle displayed. This is how you will recognize
yourself on the high score list.

On the "Code" tab, you can edit the code that controls your
robot. The game has a clock that ticks once per second. At
each tick, your code runs in an environment that includes
the API described on the "API" tab. Any errors, messages,
calls to `console.log` result in entries in the
"Log" tab.

#### Movement

Your code can contain anything that is legal Javascript.
It should culminate in a call to one of the three movement
functions:

* `moveForward()`
* `turnLeft()`
* `turnRight()`

The main constraint on your code is that you can't call
more than one movement function per tick. So think of your
code as answering the question: in the current state of the
world, what is the right next move?

If you call two movement functions in one tick, only the
first one will be executed. The others will result in an
error message on the "Log" tab. 

#### Keeping Track of State

One of the challenges you will face is that each invocation
of your code needs to figure out all over again what it
should do next. For example, let's say you hit a wall. You'd
like to turn and then move along the wall until you get to
the end. So on the current tick, you turn right. But on the
next tick you've forgotton what you were doing, so you turn
back again to face toward the exit. The result is that your
bot wiggles in place without every moving forward.

Really what you'd like is some way to remember what you're
doing from one tick to the next.
To make this scenario easier to handle, there is a global
variable `state` that you can use.
This variable is initially set to the value
`"initial"`. If you change this to a different
state, such as `"moving"`, then on the next tick
you can retrieve this value and act accordingly.

#### Sensors

In order to decide what motion to take, it's useful to be
able to ask questions about the world around you. You can
do this with the help of five sensor functions:

* `getLevel()`
* `getDirection()`
* `getPosition()`
* `getExitPosition()`
* `whatsAt(pos)`

A position `pos = [x, y]` is generally a list of
length two, where `pos[0]` is the column and
`pos[1]` is the row, with

* `0 < pos[0] < 80`
* `0 < pos[1] < 40`

So for example,

* `var dx = getExitPosition()[0] - getPosition()[0]`

sets `dx` to be the column distance from your
robot to the exit.

A direction `dir` is generally an integer of
0, 1, 2, or 3. The thing to note is that in some contexts,
like `getDirection()`, the direction is the
absolute heading of the robot (up, right, down, or left),
but in some contexts, like `canMove(dir)`, the
direction is relative to the current heading of the robot
(forward, right, backward, or left).

#### Levels

Your robot starts off on level 0. In each level, there is a
spawn point marked by "." and a goal marked by "o". The
chellenge is to navigate your robot to the goal as quickly
as you can.

Each time you reach the goal, you receive some points and
then spawn on the next level. When you pass the last level,
you respawn back on level 0.

Each level has its own quirks. To see a detailed description
of the levels, click on the "Levels" tab.

#### Jail

In order to keep the server from being overloaded, it throws
misbehaving robots in "jail." This means the robot is removed
from the board for some number of seconds, and then respawns
on level 0.

There are three possible offenses:

* Running for more than 250ms.
* Having an error that prevents your code from running.
  In this case, the error message is printed to your log.
* Staying at the same position for 60 ticks.

On the first offense, the robot is jailed for 0-10 seconds,
on the second offense, 0-60 seconds, on the third offense,
0-5 minutes, and on the fourth offense, 0-60 minutes. If your
robot ever successfully moves to a new position using
`moveForward()` without bumping into a wall, its
idle timer and its entire criminal record are reset.

The other way to reset your robot is by submitting new code.
Anytime you hit the "Submit" button, your robot is immediately
released from jail with a clean record.
