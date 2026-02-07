/**
 * Dashboard Plugin Registry
 * Registers product plugins for sidebar navigation and lazy-loaded routes.
 */

import { lazy } from 'react';
import type { ComponentType, LazyExoticComponent } from 'react';
import type { DashboardPlugin } from '@node2flow/dashboard-core';
import {
  Server,
  Link as LinkIcon,
  Workflow,
  PlayCircle,
  Key,
  Tag,
  Variable,
  Users,
} from 'lucide-react';

export interface PluginRoute {
  path: string;
  component: LazyExoticComponent<ComponentType<any>>;
}

export interface AppPlugin extends DashboardPlugin {
  routes: PluginRoute[];
}

// ============================================
// n8n Plugin
// ============================================

const n8nPlugin: AppPlugin = {
  id: 'n8n',
  name: 'n8n Management',
  icon: Server,
  requiresConnection: true,
  sidebarItems: [
    { name: 'Connections', href: '/n8n/connections', icon: LinkIcon },
    { name: 'Workflows', href: '/n8n/workflows', icon: Workflow },
    { name: 'Executions', href: '/n8n/executions', icon: PlayCircle },
    { name: 'Credentials', href: '/n8n/credentials', icon: Key },
    { name: 'Tags', href: '/n8n/tags', icon: Tag },
    { name: 'Variables', href: '/n8n/variables', icon: Variable },
    { name: 'Users', href: '/n8n/users', icon: Users },
  ],
  routes: [
    { path: '/n8n/connections', component: lazy(() => import('./n8n/Connections')) },
    { path: '/n8n/workflows', component: lazy(() => import('./n8n/WorkflowList')) },
    { path: '/n8n/executions', component: lazy(() => import('./n8n/ExecutionList')) },
    { path: '/n8n/credentials', component: lazy(() => import('./n8n/CredentialList')) },
    { path: '/n8n/tags', component: lazy(() => import('./n8n/TagList')) },
    { path: '/n8n/variables', component: lazy(() => import('./n8n/VariableList')) },
    { path: '/n8n/users', component: lazy(() => import('./n8n/N8nUserList')) },
  ],
};

// ============================================
// All Plugins
// ============================================

export const plugins: AppPlugin[] = [n8nPlugin];
