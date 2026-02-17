import { lazy } from 'react';
import { PluginTabs } from '@node2flow/dashboard-core';

const Connections = lazy(() => import('./Connections'));
const MessageTools = lazy(() => import('./MessageTools'));
const ChannelList = lazy(() => import('./ChannelList'));
const FileManager = lazy(() => import('./FileManager'));
const UserList = lazy(() => import('./UserList'));

export default function SlackPluginPage() {
  return (
    <PluginTabs
      tabs={[
        { id: 'connections', label: 'Connections', component: Connections },
        { id: 'messages', label: 'Messages', component: MessageTools },
        { id: 'channels', label: 'Channels', component: ChannelList },
        { id: 'files', label: 'Files & Pins', component: FileManager },
        { id: 'users', label: 'Users & Tools', component: UserList },
      ]}
    />
  );
}
