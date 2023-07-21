import React from 'react';

export default class LevelsTab extends React.Component {
    render() { return (<>
        <h5>Level 0: The Plains</h5>
        <ul>
            <li>Wide open, no internal walls!</li>
            <li>You get 100 points when you get to the exit.</li>
        </ul>

        <h5>Level 1: Shifting Sand Land</h5>
        <ul>
            <li>
                There are rectangular "hills" that may block your path.
            </li>
            <li>
                The area is tectonically unstable. Hills grow, shrink,
                and move over time.
            </li>
            <li>
                Navigating around them may be tricky; see the "State" section
                on the "General" tab for some ideas.
            </li>
            <li>
                If you bump into a wall or another player, you get a bloody
                nose and lose a point.
            </li>
            <li>You get 200 points when you get to the exit.</li>
        </ul>

        <h5>Level 2: Moria</h5>
        <ul>
            <li>Navigate your way through a cave-laced mountain.</li>
            <li>
                The caves and tunnels are magical. They shift around over time.
            </li>
            <li>
                If you bump into a wall, you get a bloody nose and lose a point.
            </li>
            <li>
                But if you bump into another player, you gain 100 points and
                bump them back to level 0. Players near spawn and exit are
                protected to avoid griefing. See the API function
                <code>isProtected</code> for an easy way to determine if a player
                can be bumped off.
            </li>
            <li>You get 500 points when you get to the exit.</li>
            <li>
                To avoid exit camping, the idle timer on this level is reduced
                to 5 seconds.
            </li>
        </ul>

        <h5>Level 3: There can be only one</h5>
        <ul>
            <li>
                This level is all about PVP. Most rules are the same as level 2,
                with a few exceptions.
            </li>
            <li>
                There's no exit! But you get 3 points per tick just for surviving.
            </li>
            <li>
                You get 200 points every time you bump off another player.
            </li>
            <li>
                The idle timer is back to 60 seconds. You're welcome to camp
                anywhere you want, anything goes.
            </li>
            <li>
                <p>
                    An ancient civilization has left behind some automata that wander
                    around randomly and can bump you off if you're not careful.
                </p>
                <p>
                    Bumping off an automaton gives you 100 points. Look at the function
                    <code>isWorthPoints</code> for a way to detect automata.
                </p>
                <p>
                    The automata are equipped with a basic hunting instinct, and they
                    have the ability to swarm. On every tick, they have a 10% chance
                    to decide (together) on a new player to target.
                </p>
            </li>
        </ul>
    </>);}
}
