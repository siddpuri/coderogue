import { useState, useEffect } from 'react';
import { useAppSelector } from '../client/redux_hooks';

import Tab from 'react-bootstrap/Tab';
import Tabs from 'react-bootstrap/Tabs';

import Markdown from 'react-markdown'

import generalMarkdown from '../assets/general_tab.md?raw';
import ApiTab from '../tabs/api_tab';
import KeybindingsTab from '../tabs/keybindings_tab';
import levelsMarkdown from '../assets/levels_tab.md?raw';
import newsMarkdown from '../assets/news_tab.md?raw';

import CodeTab from '../tabs/code_tab';
import LogTab from '../tabs/log_tab';
import PlayerTab from '../tabs/player_tab';
import AccountTab from '../tabs/account_tab';

const tabs = [
    { name: 'General', component: <Markdown>{generalMarkdown}</Markdown> },
    { name: 'Api', component: <ApiTab /> },
    { name: 'Shortcuts', component: <KeybindingsTab /> },
    { name: 'Levels', component: <Markdown>{levelsMarkdown}</Markdown> },
    { name: 'News', component: <Markdown>{newsMarkdown}</Markdown> },
    { name: 'Code', component: <CodeTab />, disable: true },
    { name: 'Log', component: <LogTab />, disable: true },
    { name: 'Player', component: <PlayerTab /> },
    { name: 'Account', component: <AccountTab /> },
];

const message = <div className="text-center">Log in to see this tab.</div>;

export default function TabPane() {
    const isLoggedIn = useAppSelector(state => state.login?.credentials?.playerId ?? null);
    const [key, setKey] = useState<string | null>('General');

    useEffect(() => { if (isLoggedIn) setKey('Code'); }, []);

    return <>
        <Tabs
            activeKey={key ?? undefined}
            onSelect={k => setKey(k)}
            className="mt-3 mb-3"
            justify
        >
            {tabs.map(({ name, component, disable }) => (
                <Tab key={name} eventKey={name} title={name}>
                    {disable && !isLoggedIn ? message : component}
                </Tab>
            ))}
        </Tabs>
    </>;
}
