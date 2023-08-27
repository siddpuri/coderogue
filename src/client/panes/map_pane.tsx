import { useContext, useState, useEffect } from 'react';

import { keyBindings } from '../client/key_bindings';
import * as Context from '../client/context';
import { useGetStateQuery } from '../client/server_api.js';
import LeftRightButtons from '../components/left_right_buttons';
import CanvasMap from '../components/canvas_map';

export default function MapPane() {
    const client = useContext(Context.ClientInstance);
    const state = useGetStateQuery()?.data;

    const [style, setStyle] = useState(0);
    const [level, setLevel] = useState(1);
    const [mouseCoords, setMouseCoords] = useState<[number, number] | null>(null);

    useEffect(() => {
        keyBindings['C-ArrowUp'] = () => switchLevel(1);
        keyBindings['C-ArrowDown'] = () => switchLevel(-1);
        keyBindings['C-S-ArrowUp'] = () => setStyle(1);
        keyBindings['C-S-ArrowDown'] = () => setStyle(0);
    });

    const levelName = state?.levels[level].name || 'The Plains';
    
    return (
        <div className="col">
            <div className="row align-items-baseline">
                <div className="col h2">
                    Coderogue
                </div>
                <div className="col h4 d-flex text-nowrap">
                    <div className="level">
                        level {level}:{' '}{levelName}
                    </div>
                    <LeftRightButtons
                        onLeft={() => switchLevel(-1)}
                        onRight={() => switchLevel(1)} />
                </div>
                <div className="col d-flex justify-content-end">
                    <div className="coords">{renderCoords()}</div>
                </div>
            </div>
            <CanvasMap style={style} level={level} setMouseCoords={setMouseCoords} />
        </div>
    );

    function switchLevel(dir: number): void {
        let newLevel = client.display.switchLevel(dir);
        setLevel(newLevel);
    }
    
    function renderCoords(): string | null {
        if (!mouseCoords) return null;
        return `[ ${mouseCoords[0]}, ${mouseCoords[1]} ]`;
    }
}
