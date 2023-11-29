##### Level 0: The Plains
* Wide open, no internal walls!
* You get 100 points when you get to the exit.

##### Level 1: Rolling Hills
* There are rectangular "hills" that may block your path.
* The area is tectonically unstable. Hills grow, shrink,
  and move over time.
* Navigating around them may be tricky; see the "State" section
  on the "General" tab for some ideas.
* If you bump into a wall or another player, you get a bloody
  nose and lose a point.
* You get 200 points when you get to the exit.

##### Level 2: Moria
* Navigate your way through a cave-laced mountain.
* The caves and tunnels are magical. They shift around over time.
* If you bump into a wall, you get a bloody nose and lose a point.
* But if you bump into another player, you gain 100 points and
  bump them back to level 0. Players near spawn and exit are
  protected to avoid griefing. See the API function
  `isProtected` for an easy way to determine if a player
  can be bumped off.
* You get 500 points when you get to the exit.
* To avoid exit camping, the idle timer on this level is reduced
  to 5 seconds.

##### Level 3: There can be only one
* This level is all about PVP. Most rules are the same as level 2,
  with a few exceptions.
* There's no exit! But you get 3 points per tick just for surviving.
* You get 200 points every time you bump off another player.
* The idle timer is back to 60 seconds. You're welcome to camp
  anywhere you want, anything goes.
* An ancient civilization has left behind some automata that wander
  around randomly and can bump you off if you're not careful.
  * Bumping off an automaton gives you 100 points. Look at the function
    `isWorthPoints` for a way to detect automata.
  * The automata are equipped with a basic hunting instinct, and they
    have the ability to swarm. On every tick, they have a 10% chance
    to decide (together) on a new player to target.
