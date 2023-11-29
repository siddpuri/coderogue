export default function LogTab() {
    return <>
        <div className="row">
            <div className="col">
                <textarea className="form-control font-monospace" id="log-text" rows={20} />
            </div>
            <div className="col-2">
                <div className="d-grid gap-2">
                    <button type="button" className="btn btn-secondary" id="respawn2">Respawn</button>
                    <button type="button" className="btn btn-secondary" id="freeze">Freeze</button>
                    <div className="btn-group-vertical">
                        <button type="button" className="btn btn-secondary active" id="show-all">Show all</button>
                        <button type="button" className="btn btn-secondary" id="show-latest">Just latest</button>
                        <button type="button" className="btn btn-secondary" id="show-filtered">Filter by</button>
                        <input type="text" className="form-control" id="filter-text" placeholder="Filter" />
                    </div>
                </div>
            </div>
        </div>
    </>;
}
