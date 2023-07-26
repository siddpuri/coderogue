export default function PlayerPane() {
    return (
        <div className="col">
            <div className="row align-items-baseline">
                <div className="col h2">
                    Players
                </div>
                <div className="col d-flex justify-content-end">
                    <div className="btn-group ms-2 mb-2">
                        <button type="button" className="btn btn-sm btn-light text-muted" id="first-players">⟪</button>
                        <button type="button" className="btn btn-sm btn-light text-muted" id="prev-players">⟨</button>
                        <button type="button" className="btn btn-sm btn-light text-muted" id="next-players">⟩</button>
                    </div>
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
