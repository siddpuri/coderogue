import React from 'react';
import Editor, { useMonaco, loader } from '@monaco-editor/react';

export default class CodeTab extends React.Component {
    render() { return (<>
        <div className="col-10">
            <Editor
                height="80vh"
                defaultLanguage="javascript"
                defaultValue="// Write your code here"
            />
        </div>
        <div className="col">
            <div className="d-grid gap-2">
                <button type="button" className="btn btn-secondary" id="respawn1">Respawn</button>
                <button type="button" className="btn btn-secondary" id="reformat">Reformat</button>
                <button type="button" className="btn btn-primary" id="submit">Submit</button>
            </div>
        </div>
    </>);}
}
