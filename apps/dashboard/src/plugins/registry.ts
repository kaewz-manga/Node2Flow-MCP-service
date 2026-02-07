/**
 * Dashboard Plugin Registry
 * Registers product plugins for sidebar navigation, lazy-loaded routes,
 * and content metadata used by global pages (Landing, Dashboard, Documentation, FAQ).
 */

import { lazy } from 'react';
import type { ComponentType, LazyExoticComponent, ReactNode } from 'react';
import type { DashboardPlugin } from '@node2flow/dashboard-core';

// ============================================
// Plugin Types
// ============================================

export interface PluginRoute {
  path: string;
  component: LazyExoticComponent<ComponentType<any>>;
}

export interface PluginFeature {
  icon: ReactNode;
  title: string;
  description: string;
}

export interface PluginFAQItem {
  question: string;
  answer: ReactNode;
}

export interface PluginFAQCategory {
  name: string;
  icon: ReactNode;
  items: PluginFAQItem[];
}

export interface PluginContent {
  // Landing page
  tagline: string;
  description: string;
  features: PluginFeature[];
  setupSteps: { title: string; description: string }[];
  demoCode: string;
  externalDocUrl?: string;

  // Dashboard
  quickStartSteps: string[];
  emptyConnectionCTA: string;

  // Documentation
  connectionGuide: ReactNode;
  examplePrompts: string[];
  configSections?: ReactNode;
  mcpConfigName?: string;

  // FAQ
  faqCategories: PluginFAQCategory[];
}

export interface AppPlugin extends DashboardPlugin {
  routes: PluginRoute[];
  content: PluginContent;
}

// ============================================
// n8n Plugin
// ============================================

import { n8nContent } from './n8n/content';
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
  content: n8nContent,
};

// ============================================
// All Plugins
// ============================================

export const plugins: AppPlugin[] = [n8nPlugin];
