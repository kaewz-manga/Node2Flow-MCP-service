import { lazy } from 'react';
import { PluginTabs } from '@node2flow/dashboard-core';

const Connections = lazy(() => import('./Connections'));
const MessageTools = lazy(() => import('./MessageTools'));
const RichMenuList = lazy(() => import('./RichMenuList'));
const UserList = lazy(() => import('./UserList'));

export default function LinePluginPage() {
  return (
    <PluginTabs
      tabs={[
        { id: 'connections', label: 'Connections', component: Connections },
        { id: 'messages', label: 'Messages', component: MessageTools },
        { id: 'richmenus', label: 'Rich Menus', component: RichMenuList },
        { id: 'users', label: 'Users & Groups', component: UserList },
      ]}
    />
  );
}
