import Tab from 'react-bootstrap/Tab';
import Tabs from 'react-bootstrap/Tabs';

import CodeTab from '../tabs/code_tab';
import LogTab from '../tabs/log_tab';
import PlayerTab from '../tabs/player_tab';
import NewsTab from '../tabs/news_tab';
import GeneralTab from '../tabs/general_tab';
import ApiTab from '../tabs/api_tab';
import LevelsTab from '../tabs/levels_tab';
import KeybindingsTab from '../tabs/keybindings_tab';
import AccountTab from '../tabs/account_tab';

const tabs = [
    { name: 'Code', component: CodeTab },
    { name: 'Log', component: LogTab },
    { name: 'Player', component: PlayerTab },
    { name: 'News', component: NewsTab },
    { name: 'General', component: GeneralTab },
    { name: 'Api', component: ApiTab },
    { name: 'Levels', component: LevelsTab },
    { name: 'Shortcuts', component: KeybindingsTab },
    { name: 'Account', component: AccountTab },
]

export default function TabPane() {
    return (
        <Tabs defaultActiveKey="code" id="tab-pane" className="mt-3 mb-3" justify>
            {tabs.map(({ name, component: Component }) => (
                <Tab eventKey={name} title={name}>
                    <Component />
                </Tab>
            ))}
        </Tabs>
    );
}
