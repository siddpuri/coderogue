import React from 'react';

export default class NewsTab extends React.Component {
    render() { return (<>
        <h5>News</h5>
        <ul>
            <li>
                <p className="fw-bold">June 9</p>
                <p>The server runs faster now!</p>
                <p>
                    Some of you may have noticed that the server was coming under increasing
                    strain with players writing increasingly sophisticated algorithms. In
                    order to keep the server responsive and reduce script execution timeouts,
                    the server code has undergone some performance optimizations, and the
                    server itself has been upgraded to a faster machine.
                </p>
            </li>
            <li>
                <p className="fw-bold">June 5</p>
                <p>The code text window is now an editor!</p>
                <p>It uses a plugin that provides all the goodness of VS Code: syntax highlighting, error checking, and more.</p>
                <p>Many thanks to contributor Yutao Huang (sleepy-red-dog's dad)!</p>
            </li>
            <li>
                <p className="fw-bold">June 4</p>
                <p>Oh no, the automata are starting to gain consciousness!</p>
                <p>They will now randomly swarm players.</p>
                <p>Whatever will happen next??</p>
            </li>
            <li>
                <p className="fw-bold">June 3</p>
                <p>Automata have spawned on Level 3!</p>
                <p>See Levels tab for more details.</p>
            </li>
        </ul>
    </>);}
}
