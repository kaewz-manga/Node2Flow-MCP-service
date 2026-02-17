import { lazy } from 'react';
import { PluginTabs } from '@node2flow/dashboard-core';

const Connections = lazy(() => import('./Connections'));
const WorkflowList = lazy(() => import('./WorkflowList'));
const ExecutionList = lazy(() => import('./ExecutionList'));
const CredentialList = lazy(() => import('./CredentialList'));
const TagList = lazy(() => import('./TagList'));
const N8nUserList = lazy(() => import('./N8nUserList'));

export default function N8nPluginPage() {
  return (
    <PluginTabs
      tabs={[
        { id: 'connections', label: 'Connections', component: Connections },
        { id: 'workflows', label: 'Workflows', component: WorkflowList },
        { id: 'executions', label: 'Executions', component: ExecutionList },
        { id: 'credentials', label: 'Credentials', component: CredentialList },
        { id: 'tags', label: 'Tags', component: TagList },
        { id: 'users', label: 'Users', component: N8nUserList },
      ]}
    />
  );
}
