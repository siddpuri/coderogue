import React, { useContext } from 'react';

import * as Context from './context.js';

export default function KeyBindingProvider({ children }: React.PropsWithChildren<object>) {
    const client = useContext(Context.ClientInstance);
    const mapAccessor = useContext(Context.MapAccessor);
    const serverApi = useContext(Context.ServerApi);

    const keybindings: { [key: string]: () => void } = {
        'C-s':           () => serverApi.submitCode(),
        'C-[':           () => client.display.switchTab(-1),
        'C-]':           () => client.display.switchTab(1),
        'C-ArrowUp':     () => mapAccessor.current.switchLevel(1),
        'C-ArrowDown':   () => mapAccessor.current.switchLevel(-1),
        'C-S-ArrowUp':   () => mapAccessor.current.setStyle(1),
        'C-S-ArrowDown': () => mapAccessor.current.setStyle(0),
    };

    return (
        <div onKeyDown={onKeyDown}>
            {children}
        </div>
    );

    function onKeyDown(event: React.KeyboardEvent<HTMLDivElement>): void {
        let key = event.key;
        if (event.shiftKey) key = 'S-' + key;
        if (event.ctrlKey) key = 'C-' + key;
        if (!keybindings[key]) return;
        keybindings[key]();
        event.preventDefault();
    }
}
