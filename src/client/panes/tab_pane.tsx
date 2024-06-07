import { useState, useEffect } from 'react';
import Tab from 'react-bootstrap/Tab';
import Tabs from 'react-bootstrap/Tabs';
import Markdown from 'react-markdown'

import { useAppSelector } from '../client/redux_hooks';
import { keyBindings } from '../client/key_bindings';

import { useGetStateQuery } from '../state/server_api';

import generalMarkdown from '../assets/general_tab.md?raw';
import ApiTab from './api_tab';
import KeybindingsTab from './keybindings_tab';
import levelsMarkdown from '../assets/levels_tab.md?raw';
import newsMarkdown from '../assets/news_tab.md?raw';
import CodeTab from './code_tab';
import PlayerTab from './player_tab';
import GradingTab from './grading_tab';
import AccountTab from './account_tab';

const message = <div className="text-center">Log in to see this tab.</div>;

export default function TabPane() {
    const gameState = useGetStateQuery()?.data;
    const currentPlayer = useAppSelector(state => state.login?.credentials?.playerId ?? null);
    const [tab, setTab] = useState<string | null>('General');

    useEffect(bindKeys);
    useEffect(() => { if (currentPlayer) setTab('Code'); }, []);

    let isTeacher = currentPlayer && gameState?.players[currentPlayer]?.isTeacher;

    const tabs = [
        { name: 'General', component: <Markdown>{generalMarkdown}</Markdown> },
        { name: 'Api', component: <ApiTab /> },
        { name: 'Shortcuts', component: <KeybindingsTab /> },
        { name: 'Levels', component: <Markdown>{levelsMarkdown}</Markdown> },
        { name: 'News', component: <Markdown>{newsMarkdown}</Markdown> },
        { name: 'Code', component: currentPlayer? <CodeTab /> : message },
        { name: 'Player', component: <PlayerTab /> },
        { name: 'Grading', component: isTeacher? <GradingTab /> : null },
        { name: 'Account', component: <AccountTab /> },
    ];

    return <>
        <Tabs
            activeKey={tab ?? undefined}
            onSelect={k => setTab(k)}
            className="mt-3 mb-3"
            justify
        >
            {tabs.map(({ name, component }) => !component? null : (
                <Tab
                    key={name}
                    eventKey={name}
                    title={name}
                    style={{ minHeight: '1000px' }}
                >
                    {component}
                </Tab>
            ))}
        </Tabs>
    </>;

    function bindKeys(): void {
        keyBindings['C-['] = () => moveTab(-1);
        keyBindings['C-]'] = () => moveTab(1);
    }

    function moveTab(delta: number): void {
        let index = tabs.findIndex(t => t.name == tab);
        if (index >= 0) {
            index = (index + delta + tabs.length) % tabs.length;
            setTab(tabs[index].name);
        }
    }
}
