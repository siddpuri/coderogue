import { Stack } from 'react-bootstrap';
import { PanelGroup, Panel, PanelResizeHandle } from 'react-resizable-panels';

type propType = {
    left: JSX.Element;
    right: JSX.Element;
    initialPos: number;
};

export default function Slider({ left, right, initialPos }: propType) {
    return <>
        <PanelGroup direction="horizontal">
            <Panel defaultSizePercentage={75}>
                {left}
            </Panel>
            <PanelResizeHandle>
                <Stack
                    className="ms-2 me-2"
                    direction="horizontal"
                    style={{ height: '100%', color: '#888' }}
                >
                ⟨
                    <div
                        className="ms-0 me-0"
                        style={{ height: '100%', width: '2px', backgroundColor: '#ddd' }}
                    />
                ⟩
                </Stack>
            </PanelResizeHandle>
            <Panel>
                {right}
            </Panel>
        </PanelGroup>
    </>;
}