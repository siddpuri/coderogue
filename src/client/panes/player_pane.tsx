import { useContext } from 'react';

import * as Context from '../context';
import LeftRightButtons from '../components/left_right_buttons';

export default function PlayerPane() {
    const client = useContext(Context.ClientInstance);

    return (
        <div className="col">
            <div className="row align-items-baseline">
                <div className="col h2">
                    Players
                </div>
                <div className="col d-flex justify-content-end">
                    <LeftRightButtons
                        onLeftLeft={() => client.display.showPlayers(0)}
                        onLeft={() => client.display.showPlayers(-1)}
                        onRight={() => client.display.showPlayers(1)} />
                </div>
            </div>
            <div className="row">
                <div className="col">
                    <table className="table table-hover" id="players">
                        <thead><tr>
                            <th>#</th>
                            <th>Score</th>
                            <th>L</th>
                            <th>Handle</th>
                            <th>K</th>
                            <th>D</th>
                        </tr>
                        </thead>
                        <tbody />
                    </table>
                </div>
            </div>
            <div className="row">
                <div className="col-8 pe-0">
                    <input type="text" className="form-control" id="handle" placeholder="Handle" />
                </div>
                <div className="col pb-0">
                    <div className="d-grid">
                        <button type="button" className="btn btn-secondary" id="find-handle">Find</button>
                    </div>
                </div>
            </div>
        </div>
    );
}
