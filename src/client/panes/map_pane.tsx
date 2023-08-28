import { useState, useEffect } from 'react';
import { useAppSelector, useAppDispatch } from '../redux_hooks';

import { keyBindings } from '../client/key_bindings';
import { useGetStateQuery } from '../client/server_api.js';

import { displaySlice } from '../state/display_state';

import LeftRightButtons from '../components/left_right_buttons';
import CanvasMap from '../components/canvas_map';

export default function MapPane() {
    const display = useAppSelector(state => state.display);
    const actions = displaySlice.actions;
    const dispatch = useAppDispatch();
    const gameState = useGetStateQuery()?.data;

    const [mouseCoords, setMouseCoords] = useState<[number, number] | null>(null);

    useEffect(() => {
        keyBindings['C-ArrowUp'] = () => dispatch(actions.showNextLevel());
        keyBindings['C-ArrowDown'] = () => dispatch(actions.showPrevLevel());
        keyBindings['C-S-ArrowUp'] = () => dispatch(actions.setPrevStyle());
        keyBindings['C-S-ArrowDown'] = () => dispatch(actions.setNextStyle());
    });

    const levelName = gameState?.levels[display.level].name || 'The Plains';
    
    return (
        <div className="col">
            <div className="row align-items-baseline">
                <div className="col h2">
                    Coderogue
                </div>
                <div className="col h4 d-flex text-nowrap">
                    <div className="level">
                        level {display.level}:{' '}{levelName}
                    </div>
                    <LeftRightButtons
                        onLeftLeft={() => dispatch(actions.showFirstLevel())}
                        onLeft={() => dispatch(actions.showPrevLevel())}
                        onRight={() => dispatch(actions.showNextLevel())}
                        onRightRight={() => dispatch(actions.showLastLevel())} />
                </div>
                <div className="col d-flex justify-content-end">
                    <div className="coords">{renderCoords()}</div>
                </div>
            </div>
            <CanvasMap style={display.style} level={display.level} setMouseCoords={setMouseCoords} />
        </div>
    );
    
    function renderCoords(): string | null {
        if (!mouseCoords) return null;
        return `[ ${mouseCoords[0]}, ${mouseCoords[1]} ]`;
    }
}
