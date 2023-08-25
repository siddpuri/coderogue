import React from 'react';

export const keyBindings: { [key: string]: () => void } = {};

export default function KeyBindingProvider({ children }: React.PropsWithChildren<object>) {
    return (
        <div onKeyDown={onKeyDown} tabIndex={-1}>
            {children}
        </div>
    );

    function onKeyDown(event: React.KeyboardEvent<HTMLDivElement>): void {
        let key = event.key;
        if (event.shiftKey) key = 'S-' + key;
        if (event.ctrlKey) key = 'C-' + key;
        if (!keyBindings[key]) return;
        keyBindings[key]();
        event.preventDefault();
    }
}
