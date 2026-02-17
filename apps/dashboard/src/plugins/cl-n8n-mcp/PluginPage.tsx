import { lazy } from 'react';
import { PluginTabs } from '@node2flow/dashboard-core';

const Connections = lazy(() => import('./Connections'));
const NodeExplorer = lazy(() => import('./NodeExplorer'));
const Templates = lazy(() => import('./Templates'));
const WorkflowTools = lazy(() => import('./WorkflowTools'));

export default function ClN8nMcpPluginPage() {
  return (
    <PluginTabs
      tabs={[
        { id: 'connections', label: 'Connections', component: Connections },
        { id: 'nodes', label: 'Node Explorer', component: NodeExplorer },
        { id: 'templates', label: 'Templates', component: Templates },
        { id: 'tools', label: 'Workflow Tools', component: WorkflowTools },
      ]}
    />
  );
}
