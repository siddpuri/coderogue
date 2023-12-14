import { Table } from 'react-bootstrap';
import Markdown from 'react-markdown';

type propType = {
    name: string;
    header: string;
    body: { line: string, desc: string }[];
};

export default function LookupTable({ name, header, body }: propType) {
    return <>
        <div className="h4">{name}</div>
        <Table>
            <thead>
                <tr>
                    <th className="col-3">{header}</th>
                    <th>Description</th>
                </tr>
            </thead>
            <tbody>
                {body.map(({ line, desc }) =>
                    <tr key={line}>
                        <td><code>{line}</code></td>
                        <td><Markdown>{desc.replace(/^ */gm, '')}</Markdown></td>
                    </tr>
                )}
            </tbody>
        </Table>
    </>;
}