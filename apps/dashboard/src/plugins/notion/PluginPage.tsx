import { lazy } from 'react';
import { PluginTabs } from '@node2flow/dashboard-core';

const Connections = lazy(() => import('./Connections'));
const DatabaseList = lazy(() => import('./DatabaseList'));
const PageList = lazy(() => import('./PageList'));
const BlockList = lazy(() => import('./BlockList'));

export default function NotionPluginPage() {
  return (
    <PluginTabs
      tabs={[
        { id: 'connections', label: 'Connections', component: Connections },
        { id: 'databases', label: 'Databases', component: DatabaseList },
        { id: 'pages', label: 'Pages', component: PageList },
        { id: 'blocks', label: 'Blocks', component: BlockList },
      ]}
    />
  );
}
