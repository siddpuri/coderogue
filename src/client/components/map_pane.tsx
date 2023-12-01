import { useEffect } from 'react';
import { useAppSelector, useAppDispatch } from '../client/redux_hooks';
import { useGetStateQuery } from '../state/server_api.js';
import { keyBindings } from '../client/key_bindings';

import { displaySlice } from '../state/display_state';

import LeftRightButtons from '../components/left_right_buttons';
import CanvasMap from '../components/canvas_map';

export default function MapPane() {
    const gameState = useGetStateQuery()?.data;
    const display = useAppSelector(state => state.display);
    const dispatch = useAppDispatch();

    const numLevels = gameState?.levels.length || 0;
    const levelName = gameState?.levels[display.level].name || 'The Plains';

    bindKeys();
    showHighlightedPlayer();

    return <>
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
                        onLeftLeft={showFirstLevel}
                        onLeft={showPrevLevel}
                        onRight={showNextLevel}
                        onRightRight={showLastLevel}
                    />
                </div>
                <div className="col d-flex justify-content-end">
                    <div className="coords">{renderCoords()}</div>
                </div>
            </div>
            <CanvasMap />
        </div>
    </>;

    function bindKeys(): void {
        useEffect(() => {
            keyBindings['C-S-ArrowLeft'] = showPrevLevel;
            keyBindings['C-S-ArrowRight'] = showNextLevel;
            keyBindings['C-S-ArrowUp'] = () => dispatch(displaySlice.actions.switchStyle());
            keyBindings['C-S-ArrowDown'] = () => dispatch(displaySlice.actions.switchStyle());
        });
    }

    function showHighlightedPlayer(): void {
        let targetLevel = gameState?.players[display.highlightedPlayer ?? -1]?.levelNumber;
        if (targetLevel && display.level != targetLevel) {
            dispatch(displaySlice.actions.showLevel(targetLevel));
        }    
    }

    function showFirstLevel(): void {
        if (display.level == 0) return;
        dispatch(displaySlice.actions.showFirstLevel());
        dispatch(displaySlice.actions.highlightPlayer(null));
    }

    function showPrevLevel(): void {
        if (display.level == 0) return;
        dispatch(displaySlice.actions.showPrevLevel());
        dispatch(displaySlice.actions.highlightPlayer(null));
    }

    function showNextLevel(): void {
        if (display.level == numLevels - 1) return;
        dispatch(displaySlice.actions.showNextLevel(numLevels));
        dispatch(displaySlice.actions.highlightPlayer(null));
    }

    function showLastLevel(): void {
        if (display.level == numLevels - 1) return;
        dispatch(displaySlice.actions.showLastLevel(numLevels));
        dispatch(displaySlice.actions.highlightPlayer(null));
    }

    function renderCoords(): string | null {
        if (!display.coords) return null;
        return `[ ${display.coords[0]}, ${display.coords[1]} ]`;
    }
}
