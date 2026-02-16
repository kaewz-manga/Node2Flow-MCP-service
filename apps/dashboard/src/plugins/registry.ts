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
  Users,
} from 'lucide-react';

const n8nPlugin: AppPlugin = {
  id: 'n8n',
  name: 'n8n Management',
  icon: Server,
  logo: '/logos/n8n.svg?v=2',
  requiresConnection: true,
  sidebarItems: [
    { name: 'Connections', href: '/n8n/connections', icon: LinkIcon },
    { name: 'Workflows', href: '/n8n/workflows', icon: Workflow },
    { name: 'Executions', href: '/n8n/executions', icon: PlayCircle },
    { name: 'Credentials', href: '/n8n/credentials', icon: Key },
    { name: 'Tags', href: '/n8n/tags', icon: Tag },
    { name: 'Users', href: '/n8n/users', icon: Users },
  ],
  routes: [
    { path: '/n8n/connections', component: lazy(() => import('./n8n/Connections')) },
    { path: '/n8n/workflows', component: lazy(() => import('./n8n/WorkflowList')) },
    { path: '/n8n/executions', component: lazy(() => import('./n8n/ExecutionList')) },
    { path: '/n8n/credentials', component: lazy(() => import('./n8n/CredentialList')) },
    { path: '/n8n/tags', component: lazy(() => import('./n8n/TagList')) },
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
  logo: '/logos/wordpress.svg?v=2',
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
  logo: '/logos/n8n-alt.svg?v=2',
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
  logo: '/logos/gemini.png?v=2',
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
  logo: '/logos/line.png?v=2',
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
  logo: '/logos/telegram.svg?v=2',
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
  logo: '/logos/notion.svg?v=2',
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
// Notion Official Plugin
// ============================================

import { notionOfficialContent } from './notion-official/content';
import {
  BookOpen as NotionOffIcon,
  Link as NotionOffLinkIcon,
} from 'lucide-react';

const notionOfficialPlugin: AppPlugin = {
  id: 'notion-official',
  name: 'Notion (Official)',
  icon: NotionOffIcon,
  logo: '/logos/notion.svg?v=2',
  requiresConnection: true,
  sidebarItems: [
    { name: 'Connections', href: '/notion-official/connections', icon: NotionOffLinkIcon },
  ],
  routes: [
    { path: '/notion-official/connections', component: lazy(() => import('./notion-official/Connections')) },
  ],
  content: notionOfficialContent,
};

// ============================================
// LINE Official Plugin
// ============================================

import { lineOfficialContent } from './line-official/content';
import {
  MessageCircle as LineOffIcon,
  Link as LineOffLinkIcon,
} from 'lucide-react';

const lineOfficialPlugin: AppPlugin = {
  id: 'line-official',
  name: 'LINE (Official)',
  icon: LineOffIcon,
  logo: '/logos/line.png?v=2',
  requiresConnection: true,
  sidebarItems: [
    { name: 'Connections', href: '/line-official/connections', icon: LineOffLinkIcon },
  ],
  routes: [
    { path: '/line-official/connections', component: lazy(() => import('./line-official/Connections')) },
  ],
  content: lineOfficialContent,
};

// ============================================
// Playwright Plugin (Browser Automation)
// ============================================

import { playwrightContent } from './playwright/content';
import {
  Globe as PlaywrightIcon,
  Link as PlaywrightLinkIcon,
} from 'lucide-react';

const playwrightPlugin: AppPlugin = {
  id: 'playwright',
  name: 'Browser Automation',
  icon: PlaywrightIcon,
  logo: '/logos/playwright.svg?v=2',
  requiresConnection: true,
  sidebarItems: [
    { name: 'Connections', href: '/playwright/connections', icon: PlaywrightLinkIcon },
  ],
  routes: [
    { path: '/playwright/connections', component: lazy(() => import('./playwright/Connections')) },
  ],
  content: playwrightContent,
};

// ============================================
// Google Workspace Plugin
// ============================================

import { googleWorkspaceContent } from './google-workspace/content';
import {
  HardDrive as GWSIcon,
  Link as GWSLinkIcon,
} from 'lucide-react';

const googleWorkspacePlugin: AppPlugin = {
  id: 'google-workspace',
  name: 'Google Workspace',
  icon: GWSIcon,
  logo: '/logos/google.svg?v=2',
  requiresConnection: true,
  sidebarItems: [
    { name: 'Connections', href: '/google-workspace/connections', icon: GWSLinkIcon },
  ],
  routes: [
    { path: '/google-workspace/connections', component: lazy(() => import('./google-workspace/Connections')) },
  ],
  content: googleWorkspaceContent,
};

// ============================================
// Slack Plugin
// ============================================

import { slackContent } from './slack/content';
import {
  MessageSquare as SlackIcon,
  Link as SlackLinkIcon,
  Send as SlackSend,
  Hash as SlackHash,
  Paperclip as SlackFiles,
  Users as SlackUsers,
} from 'lucide-react';

const slackPlugin: AppPlugin = {
  id: 'slack',
  name: 'Slack',
  icon: SlackIcon,
  logo: '/logos/slack.png?v=2',
  requiresConnection: true,
  sidebarItems: [
    { name: 'Connections', href: '/slack/connections', icon: SlackLinkIcon },
    { name: 'Messages', href: '/slack/messages', icon: SlackSend },
    { name: 'Channels', href: '/slack/channels', icon: SlackHash },
    { name: 'Files & Pins', href: '/slack/files', icon: SlackFiles },
    { name: 'Users & Tools', href: '/slack/users', icon: SlackUsers },
  ],
  routes: [
    { path: '/slack/connections', component: lazy(() => import('./slack/Connections')) },
    { path: '/slack/messages', component: lazy(() => import('./slack/MessageTools')) },
    { path: '/slack/channels', component: lazy(() => import('./slack/ChannelList')) },
    { path: '/slack/files', component: lazy(() => import('./slack/FileManager')) },
    { path: '/slack/users', component: lazy(() => import('./slack/UserList')) },
  ],
  content: slackContent,
};

// ============================================
// Airtable Plugin
// ============================================

import { airtableContent } from './airtable/content';
import {
  Table2 as AirtableIcon,
  Link as AirtableLinkIcon,
} from 'lucide-react';

const airtablePlugin: AppPlugin = {
  id: 'airtable',
  name: 'Airtable',
  icon: AirtableIcon,
  logo: '/logos/airtable.svg?v=2',
  requiresConnection: true,
  sidebarItems: [
    { name: 'Connections', href: '/airtable/connections', icon: AirtableLinkIcon },
  ],
  routes: [
    { path: '/airtable/connections', component: lazy(() => import('./airtable/Connections')) },
  ],
  content: airtableContent,
};

// ============================================
// YouTube Plugin
// ============================================

import { youtubeContent } from './youtube/content';
import {
  Play as YouTubeIcon,
  Link as YouTubeLinkIcon,
} from 'lucide-react';

const youtubePlugin: AppPlugin = {
  id: 'youtube',
  name: 'YouTube',
  icon: YouTubeIcon,
  logo: '/logos/youtube.svg?v=2',
  requiresConnection: true,
  sidebarItems: [
    { name: 'Connections', href: '/youtube/connections', icon: YouTubeLinkIcon },
  ],
  routes: [
    { path: '/youtube/connections', component: lazy(() => import('./youtube/Connections')) },
  ],
  content: youtubeContent,
};

// ============================================
// PostgREST Plugin
// ============================================

import { postgrestContent } from './postgrest/content';
import {
  Database as PostgrestIcon,
  Link as PostgrestLinkIcon,
} from 'lucide-react';

const postgrestPlugin: AppPlugin = {
  id: 'postgrest',
  name: 'PostgREST',
  icon: PostgrestIcon,
  logo: '/logos/postgrest.png?v=2',
  requiresConnection: true,
  sidebarItems: [
    { name: 'Connections', href: '/postgrest/connections', icon: PostgrestLinkIcon },
  ],
  routes: [
    { path: '/postgrest/connections', component: lazy(() => import('./postgrest/Connections')) },
  ],
  content: postgrestContent,
};

// ============================================
// Bitkub Plugin
// ============================================

import { bitkubContent } from './bitkub/content';
import {
  TrendingUp as BitkubIcon,
  Link as BitkubLinkIcon,
} from 'lucide-react';

const bitkubPlugin: AppPlugin = {
  id: 'bitkub',
  name: 'Bitkub',
  icon: BitkubIcon,
  logo: '/logos/bitkub.png?v=2',
  requiresConnection: true,
  sidebarItems: [
    { name: 'Connections', href: '/bitkub/connections', icon: BitkubLinkIcon },
  ],
  routes: [
    { path: '/bitkub/connections', component: lazy(() => import('./bitkub/Connections')) },
  ],
  content: bitkubContent,
};

// ============================================
// Binance Plugin
// ============================================

import { binanceContent } from './binance/content';
import {
  BarChart3 as BinanceIcon,
  Link as BinanceLinkIcon,
} from 'lucide-react';

const binancePlugin: AppPlugin = {
  id: 'binance',
  name: 'Binance',
  icon: BinanceIcon,
  logo: '/logos/binance.png?v=2',
  requiresConnection: true,
  sidebarItems: [
    { name: 'Connections', href: '/binance/connections', icon: BinanceLinkIcon },
  ],
  routes: [
    { path: '/binance/connections', component: lazy(() => import('./binance/Connections')) },
  ],
  content: binanceContent,
};

// ============================================
// Binance TH Plugin
// ============================================

import { binanceThContent } from './binance-th/content';
import {
  Landmark as BinanceThIcon,
  Link as BinanceThLinkIcon,
} from 'lucide-react';

const binanceThPlugin: AppPlugin = {
  id: 'binance-th',
  name: 'Binance TH',
  icon: BinanceThIcon,
  logo: '/logos/binance.png?v=2',
  requiresConnection: true,
  sidebarItems: [
    { name: 'Connections', href: '/binance-th/connections', icon: BinanceThLinkIcon },
  ],
  routes: [
    { path: '/binance-th/connections', component: lazy(() => import('./binance-th/Connections')) },
  ],
  content: binanceThContent,
};

// ============================================
// Google Sheets Plugin
// ============================================

import { googleSheetsContent } from './google-sheets/content';
import {
  FileSpreadsheet as GoogleSheetsIcon,
  Link as GoogleSheetsLinkIcon,
} from 'lucide-react';

const googleSheetsPlugin: AppPlugin = {
  id: 'google-sheets',
  name: 'Google Sheets',
  icon: GoogleSheetsIcon,
  logo: '/logos/google-sheets.svg?v=2',
  requiresConnection: true,
  sidebarItems: [
    { name: 'Connections', href: '/google-sheets/connections', icon: GoogleSheetsLinkIcon },
  ],
  routes: [
    { path: '/google-sheets/connections', component: lazy(() => import('./google-sheets/Connections')) },
  ],
  content: googleSheetsContent,
};

// ============================================
// Google Drive Plugin
// ============================================

import { googleDriveContent } from './google-drive/content';
import {
  HardDrive as GoogleDriveIcon,
  Link as GoogleDriveLinkIcon,
} from 'lucide-react';

const googleDrivePlugin: AppPlugin = {
  id: 'google-drive',
  name: 'Google Drive',
  icon: GoogleDriveIcon,
  logo: '/logos/google-drive.svg?v=2',
  requiresConnection: true,
  sidebarItems: [
    { name: 'Connections', href: '/google-drive/connections', icon: GoogleDriveLinkIcon },
  ],
  routes: [
    { path: '/google-drive/connections', component: lazy(() => import('./google-drive/Connections')) },
  ],
  content: googleDriveContent,
};

// ============================================
// Google Docs Plugin
// ============================================

import { googleDocsContent } from './google-docs/content';
import {
  FileText as GoogleDocsIcon,
  Link as GoogleDocsLinkIcon,
} from 'lucide-react';

const googleDocsPlugin: AppPlugin = {
  id: 'google-docs',
  name: 'Google Docs',
  icon: GoogleDocsIcon,
  logo: '/logos/google-docs.svg?v=2',
  requiresConnection: true,
  sidebarItems: [
    { name: 'Connections', href: '/google-docs/connections', icon: GoogleDocsLinkIcon },
  ],
  routes: [
    { path: '/google-docs/connections', component: lazy(() => import('./google-docs/Connections')) },
  ],
  content: googleDocsContent,
};

// ============================================
// Supabase Plugin
// ============================================

import { supabaseContent } from './supabase/content';
import {
  Database as SupabaseIcon,
  Link as SupabaseLinkIcon,
} from 'lucide-react';

const supabasePlugin: AppPlugin = {
  id: 'supabase',
  name: 'Supabase',
  icon: SupabaseIcon,
  logo: '/logos/supabase.svg?v=2',
  requiresConnection: true,
  sidebarItems: [
    { name: 'Connections', href: '/supabase/connections', icon: SupabaseLinkIcon },
  ],
  routes: [
    { path: '/supabase/connections', component: lazy(() => import('./supabase/Connections')) },
  ],
  content: supabaseContent,
};

// ============================================
// SQLite Plugin
// ============================================

import { sqliteContent } from './sqlite/content';
import {
  Database as SqliteIcon,
  Link as SqliteLinkIcon,
} from 'lucide-react';

const sqlitePlugin: AppPlugin = {
  id: 'sqlite',
  name: 'SQLite',
  icon: SqliteIcon,
  logo: '/logos/sqlite.png?v=3',
  requiresConnection: true,
  sidebarItems: [
    { name: 'Connections', href: '/sqlite/connections', icon: SqliteLinkIcon },
  ],
  routes: [
    { path: '/sqlite/connections', component: lazy(() => import('./sqlite/Connections')) },
  ],
  content: sqliteContent,
};

// ============================================
// Gmail
// ============================================

import { gmailContent } from './gmail/content';
import {
  Mail as GmailIcon,
  Link as GmailLinkIcon,
} from 'lucide-react';

const gmailPlugin: AppPlugin = {
  id: 'gmail',
  name: 'Gmail',
  icon: GmailIcon,
  logo: '/logos/gmail.svg?v=2',
  requiresConnection: true,
  sidebarItems: [
    { name: 'Connections', href: '/gmail/connections', icon: GmailLinkIcon },
  ],
  routes: [
    { path: '/gmail/connections', component: lazy(() => import('./gmail/Connections')) },
  ],
  content: gmailContent,
};

// ============================================
// Google Calendar
// ============================================

import { googleCalendarContent } from './google-calendar/content';
import {
  CalendarDays as GoogleCalendarIcon,
  Link as GoogleCalendarLinkIcon,
} from 'lucide-react';

const googleCalendarPlugin: AppPlugin = {
  id: 'google-calendar',
  name: 'Google Calendar',
  icon: GoogleCalendarIcon,
  logo: '/logos/google-calendar.svg?v=2',
  requiresConnection: true,
  sidebarItems: [
    { name: 'Connections', href: '/google-calendar/connections', icon: GoogleCalendarLinkIcon },
  ],
  routes: [
    { path: '/google-calendar/connections', component: lazy(() => import('./google-calendar/Connections')) },
  ],
  content: googleCalendarContent,
};

// ============================================
// Context7 Plugin (Documentation)
// ============================================

import { context7Content } from './context7/content';
import {
  BookOpen as Context7Icon,
  Link as Context7LinkIcon,
} from 'lucide-react';

const context7Plugin: AppPlugin = {
  id: 'context7',
  name: 'Context7',
  icon: Context7Icon,
  logo: '/logos/context7.png?v=3',
  requiresConnection: true,
  sidebarItems: [
    { name: 'Connections', href: '/context7/connections', icon: Context7LinkIcon },
  ],
  routes: [
    { path: '/context7/connections', component: lazy(() => import('./context7/Connections')) },
  ],
  content: context7Content,
};

// ============================================
// GitHub Plugin
// ============================================

import { githubContent } from './github/content';
import {
  GitBranch as GitHubIcon,
  Link as GitHubLinkIcon,
} from 'lucide-react';

const githubPlugin: AppPlugin = {
  id: 'github',
  name: 'GitHub',
  icon: GitHubIcon,
  logo: '/logos/github.svg?v=2',
  requiresConnection: true,
  sidebarItems: [
    { name: 'Connections', href: '/github/connections', icon: GitHubLinkIcon },
  ],
  routes: [
    { path: '/github/connections', component: lazy(() => import('./github/Connections')) },
  ],
  content: githubContent,
};

// ============================================
// Cloudflare Plugin
// ============================================

import { cloudflareContent } from './cloudflare/content';
import {
  Cloud as CloudflareIcon,
  Link as CloudflareLinkIcon,
} from 'lucide-react';

const cloudflarePlugin: AppPlugin = {
  id: 'cloudflare',
  name: 'Cloudflare',
  icon: CloudflareIcon,
  logo: '/logos/cloudflare.svg?v=2',
  requiresConnection: true,
  sidebarItems: [
    { name: 'Connections', href: '/cloudflare/connections', icon: CloudflareLinkIcon },
  ],
  routes: [
    { path: '/cloudflare/connections', component: lazy(() => import('./cloudflare/Connections')) },
  ],
  content: cloudflareContent,
};

// ============================================
// Browserbase Plugin (Cloud Browser Automation)
// ============================================

import { browserbaseContent } from './browserbase/content';
import {
  Globe as BrowserbaseIcon,
  Link as BrowserbaseLinkIcon,
} from 'lucide-react';

const browserbasePlugin: AppPlugin = {
  id: 'browserbase',
  name: 'Browserbase',
  icon: BrowserbaseIcon,
  logo: '/logos/browserbase.svg?v=2',
  requiresConnection: true,
  sidebarItems: [
    { name: 'Connections', href: '/browserbase/connections', icon: BrowserbaseLinkIcon },
  ],
  routes: [
    { path: '/browserbase/connections', component: lazy(() => import('./browserbase/Connections')) },
  ],
  content: browserbaseContent,
};

// ============================================
// Qdrant Plugin (Vector Search)
// ============================================

import { qdrantContent } from './qdrant/content';
import {
  Database as QdrantIcon,
  Link as QdrantLinkIcon,
} from 'lucide-react';

const qdrantPlugin: AppPlugin = {
  id: 'qdrant',
  name: 'Qdrant',
  icon: QdrantIcon,
  logo: '/logos/qdrant.svg?v=2',
  requiresConnection: true,
  sidebarItems: [
    { name: 'Connections', href: '/qdrant/connections', icon: QdrantLinkIcon },
  ],
  routes: [
    { path: '/qdrant/connections', component: lazy(() => import('./qdrant/Connections')) },
  ],
  content: qdrantContent,
};

// ============================================
// All Plugins
// ============================================

export const plugins: AppPlugin[] = [n8nPlugin, wordpressPlugin, clN8nMcpPlugin, geminiRagPlugin, linePlugin, telegramPlugin, notionPlugin, notionOfficialPlugin, lineOfficialPlugin, playwrightPlugin, googleWorkspacePlugin, slackPlugin, airtablePlugin, youtubePlugin, postgrestPlugin, bitkubPlugin, binancePlugin, binanceThPlugin, googleSheetsPlugin, googleDrivePlugin, googleDocsPlugin, supabasePlugin, sqlitePlugin, gmailPlugin, googleCalendarPlugin, context7Plugin, githubPlugin, cloudflarePlugin, browserbasePlugin, qdrantPlugin];
