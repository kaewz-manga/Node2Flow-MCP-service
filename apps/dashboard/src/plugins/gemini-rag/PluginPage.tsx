import { lazy } from 'react';
import { PluginTabs } from '@node2flow/dashboard-core';

const Connections = lazy(() => import('./Connections'));
const StoreList = lazy(() => import('./StoreList'));
const DocumentList = lazy(() => import('./DocumentList'));

export default function GeminiRagPluginPage() {
  return (
    <PluginTabs
      tabs={[
        { id: 'connections', label: 'Connections', component: Connections },
        { id: 'stores', label: 'Stores', component: StoreList },
        { id: 'documents', label: 'Documents', component: DocumentList },
      ]}
    />
  );
}
