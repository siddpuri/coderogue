import { useEffect } from 'react';
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

    const numLevels = gameState?.levels.length || 0;

    useEffect(() => {
        keyBindings['C-ArrowUp'] = () => dispatch(actions.showNextLevel(numLevels));
        keyBindings['C-ArrowDown'] = () => dispatch(actions.showPrevLevel());
        keyBindings['C-S-ArrowUp'] = () => dispatch(actions.switchStyle());
        keyBindings['C-S-ArrowDown'] = () => dispatch(actions.switchStyle());
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
                        onRight={() => dispatch(actions.showNextLevel(numLevels))}
                        onRightRight={() => dispatch(actions.showLastLevel(numLevels))} />
                </div>
                <div className="col d-flex justify-content-end">
                    <div className="coords">{renderCoords()}</div>
                </div>
            </div>
            <CanvasMap />
        </div>
    );
    
    function renderCoords(): string | null {
        if (!display.coords) return null;
        return `[ ${display.coords[0]}, ${display.coords[1]} ]`;
    }
}
