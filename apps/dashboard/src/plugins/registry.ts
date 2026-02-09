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
  logo: 'https://cdn.simpleicons.org/n8n/EA4B71',
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
// WordPress Plugin
// ============================================

import { wordpressContent } from './wordpress/content';
import {
  Globe,
  Link as WPLinkIcon,
  FileText,
  File,
  Image,
  MessageCircle,
} from 'lucide-react';

const wordpressPlugin: AppPlugin = {
  id: 'wordpress',
  name: 'WordPress',
  icon: Globe,
  logo: 'https://cdn.simpleicons.org/wordpress/21759B',
  requiresConnection: true,
  sidebarItems: [
    { name: 'Connections', href: '/wordpress/connections', icon: WPLinkIcon },
    { name: 'Posts', href: '/wordpress/posts', icon: FileText },
    { name: 'Pages', href: '/wordpress/pages', icon: File },
    { name: 'Media', href: '/wordpress/media', icon: Image },
    { name: 'Comments', href: '/wordpress/comments', icon: MessageCircle },
  ],
  routes: [
    { path: '/wordpress/connections', component: lazy(() => import('./wordpress/Connections')) },
    { path: '/wordpress/posts', component: lazy(() => import('./wordpress/PostList')) },
    { path: '/wordpress/pages', component: lazy(() => import('./wordpress/PageList')) },
    { path: '/wordpress/media', component: lazy(() => import('./wordpress/MediaList')) },
    { path: '/wordpress/comments', component: lazy(() => import('./wordpress/CommentList')) },
  ],
  content: wordpressContent,
};

// ============================================
// cl-n8n-mcp Plugin (n8n Workflow Builder)
// ============================================

import { clN8nMcpContent } from './cl-n8n-mcp/content';
import {
  Cpu,
  Link as McpLinkIcon,
  Search,
  FileCode,
  Wrench,
} from 'lucide-react';

const clN8nMcpPlugin: AppPlugin = {
  id: 'cl-n8n-mcp',
  name: 'Workflow Builder',
  icon: Cpu,
  logo: 'https://cdn.simpleicons.org/n8n/FF8C69',
  requiresConnection: true,
  sidebarItems: [
    { name: 'Connections', href: '/cl-n8n-mcp/connections', icon: McpLinkIcon },
    { name: 'Node Explorer', href: '/cl-n8n-mcp/nodes', icon: Search },
    { name: 'Templates', href: '/cl-n8n-mcp/templates', icon: FileCode },
    { name: 'Workflow Tools', href: '/cl-n8n-mcp/tools', icon: Wrench },
  ],
  routes: [
    { path: '/cl-n8n-mcp/connections', component: lazy(() => import('./cl-n8n-mcp/Connections')) },
    { path: '/cl-n8n-mcp/nodes', component: lazy(() => import('./cl-n8n-mcp/NodeExplorer')) },
    { path: '/cl-n8n-mcp/templates', component: lazy(() => import('./cl-n8n-mcp/Templates')) },
    { path: '/cl-n8n-mcp/tools', component: lazy(() => import('./cl-n8n-mcp/WorkflowTools')) },
  ],
  content: clN8nMcpContent,
};

// ============================================
// Gemini RAG Plugin
// ============================================

import { geminiRagContent } from './gemini-rag/content';
import {
  Database,
  Link as GeminiLinkIcon,
  FolderOpen,
  FileSearch,
} from 'lucide-react';

const geminiRagPlugin: AppPlugin = {
  id: 'gemini-rag',
  name: 'Gemini RAG',
  icon: Database,
  logo: 'https://cdn.simpleicons.org/googlegemini/8E75B2',
  requiresConnection: true,
  sidebarItems: [
    { name: 'Connections', href: '/gemini-rag/connections', icon: GeminiLinkIcon },
    { name: 'Stores', href: '/gemini-rag/stores', icon: FolderOpen },
    { name: 'Documents', href: '/gemini-rag/documents', icon: FileSearch },
  ],
  routes: [
    { path: '/gemini-rag/connections', component: lazy(() => import('./gemini-rag/Connections')) },
    { path: '/gemini-rag/stores', component: lazy(() => import('./gemini-rag/StoreList')) },
    { path: '/gemini-rag/documents', component: lazy(() => import('./gemini-rag/DocumentList')) },
  ],
  content: geminiRagContent,
};

// ============================================
// LINE Plugin
// ============================================

import { lineContent } from './line/content';
import {
  MessageCircle as LineIcon,
  Link as LineLinkIcon,
  Send,
  Menu as LineMenu,
  Users as LineUsers,
} from 'lucide-react';

const linePlugin: AppPlugin = {
  id: 'line',
  name: 'LINE Bot',
  icon: LineIcon,
  logo: 'https://cdn.simpleicons.org/line/00C300',
  requiresConnection: true,
  sidebarItems: [
    { name: 'Connections', href: '/line/connections', icon: LineLinkIcon },
    { name: 'Messages', href: '/line/messages', icon: Send },
    { name: 'Rich Menus', href: '/line/richmenus', icon: LineMenu },
    { name: 'Users & Groups', href: '/line/users', icon: LineUsers },
  ],
  routes: [
    { path: '/line/connections', component: lazy(() => import('./line/Connections')) },
    { path: '/line/messages', component: lazy(() => import('./line/MessageTools')) },
    { path: '/line/richmenus', component: lazy(() => import('./line/RichMenuList')) },
    { path: '/line/users', component: lazy(() => import('./line/UserList')) },
  ],
  content: lineContent,
};

// ============================================
// Telegram Plugin
// ============================================

import { telegramContent } from './telegram/content';
import {
  Send as TelegramIcon,
  Link as TelegramLinkIcon,
  Send as TelegramSend,
  Users as TelegramUsers,
  Globe as TelegramWebhook,
} from 'lucide-react';

const telegramPlugin: AppPlugin = {
  id: 'telegram',
  name: 'Telegram Bot',
  icon: TelegramIcon,
  logo: 'https://cdn.simpleicons.org/telegram/26A5E4',
  requiresConnection: true,
  sidebarItems: [
    { name: 'Connections', href: '/telegram/connections', icon: TelegramLinkIcon },
    { name: 'Messages', href: '/telegram/messages', icon: TelegramSend },
    { name: 'Chats', href: '/telegram/chats', icon: TelegramUsers },
    { name: 'Webhooks', href: '/telegram/webhooks', icon: TelegramWebhook },
  ],
  routes: [
    { path: '/telegram/connections', component: lazy(() => import('./telegram/Connections')) },
    { path: '/telegram/messages', component: lazy(() => import('./telegram/MessageTools')) },
    { path: '/telegram/chats', component: lazy(() => import('./telegram/ChatManagement')) },
    { path: '/telegram/webhooks', component: lazy(() => import('./telegram/WebhookSettings')) },
  ],
  content: telegramContent,
};

// ============================================
// Notion Plugin
// ============================================

import { notionContent } from './notion/content';
import {
  BookOpen as NotionIcon,
  Link as NotionLinkIcon,
  Database as NotionDB,
  FileText as NotionPages,
  LayoutList,
} from 'lucide-react';

const notionPlugin: AppPlugin = {
  id: 'notion',
  name: 'Notion',
  icon: NotionIcon,
  logo: 'https://cdn.simpleicons.org/notion/FFFFFF',
  requiresConnection: true,
  sidebarItems: [
    { name: 'Connections', href: '/notion/connections', icon: NotionLinkIcon },
    { name: 'Databases', href: '/notion/databases', icon: NotionDB },
    { name: 'Pages', href: '/notion/pages', icon: NotionPages },
    { name: 'Blocks', href: '/notion/blocks', icon: LayoutList },
  ],
  routes: [
    { path: '/notion/connections', component: lazy(() => import('./notion/Connections')) },
    { path: '/notion/databases', component: lazy(() => import('./notion/DatabaseList')) },
    { path: '/notion/pages', component: lazy(() => import('./notion/PageList')) },
    { path: '/notion/blocks', component: lazy(() => import('./notion/BlockList')) },
  ],
  content: notionContent,
};

// ============================================
// Notion Extended Plugin (25 tools)
// ============================================

const notionExtendedPlugin: AppPlugin = {
  id: 'notion-extended',
  name: 'Notion Extended',
  icon: NotionIcon,
  logo: 'https://cdn.simpleicons.org/notion/FFFFFF',
  requiresConnection: true,
  sidebarItems: [
    { name: 'Connections', href: '/notion-extended/connections', icon: NotionLinkIcon },
    { name: 'Databases', href: '/notion-extended/databases', icon: NotionDB },
    { name: 'Pages', href: '/notion-extended/pages', icon: NotionPages },
    { name: 'Blocks', href: '/notion-extended/blocks', icon: LayoutList },
  ],
  routes: [
    { path: '/notion-extended/connections', component: lazy(() => import('./notion/Connections')) },
    { path: '/notion-extended/databases', component: lazy(() => import('./notion/DatabaseList')) },
    { path: '/notion-extended/pages', component: lazy(() => import('./notion/PageList')) },
    { path: '/notion-extended/blocks', component: lazy(() => import('./notion/BlockList')) },
  ],
  content: notionContent,
};

// ============================================
// LINE Extended Plugin (25 tools)
// ============================================

import {
  MessageCircle as LineExtIcon,
  Link as LineExtLinkIcon,
  Send as LineExtSend,
  Menu as LineExtMenu,
  Users as LineExtUsers,
} from 'lucide-react';

const lineExtendedPlugin: AppPlugin = {
  id: 'line-extended',
  name: 'LINE Extended',
  icon: LineExtIcon,
  logo: 'https://cdn.simpleicons.org/line/00C300',
  requiresConnection: true,
  sidebarItems: [
    { name: 'Connections', href: '/line-extended/connections', icon: LineExtLinkIcon },
    { name: 'Messages', href: '/line-extended/messages', icon: LineExtSend },
    { name: 'Rich Menus', href: '/line-extended/richmenus', icon: LineExtMenu },
    { name: 'Users & Groups', href: '/line-extended/users', icon: LineExtUsers },
  ],
  routes: [
    { path: '/line-extended/connections', component: lazy(() => import('./line/Connections')) },
    { path: '/line-extended/messages', component: lazy(() => import('./line/MessageTools')) },
    { path: '/line-extended/richmenus', component: lazy(() => import('./line/RichMenuList')) },
    { path: '/line-extended/users', component: lazy(() => import('./line/UserList')) },
  ],
  content: lineContent,
};

// ============================================
// Windows CLI Plugin
// ============================================

import { winCliContent } from './win-cli/content';
import {
  Terminal,
  Link as CliLinkIcon,
  Server as CliServer,
} from 'lucide-react';

const winCliPlugin: AppPlugin = {
  id: 'win-cli',
  name: 'Windows CLI',
  icon: Terminal,
  logo: 'https://cdn.simpleicons.org/windowsterminal/4D4D4D',
  requiresConnection: true,
  sidebarItems: [
    { name: 'Connections', href: '/win-cli/connections', icon: CliLinkIcon },
  ],
  routes: [
    { path: '/win-cli/connections', component: lazy(() => import('./win-cli/Connections')) },
  ],
  content: winCliContent,
};

// ============================================
// All Plugins
// ============================================

export const plugins: AppPlugin[] = [n8nPlugin, wordpressPlugin, clN8nMcpPlugin, geminiRagPlugin, linePlugin, telegramPlugin, notionPlugin, notionExtendedPlugin, lineExtendedPlugin, winCliPlugin];
