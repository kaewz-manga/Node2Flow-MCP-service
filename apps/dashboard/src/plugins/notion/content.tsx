/**
 * Notion Plugin Content
 * All Notion-specific content used by global pages (Landing, Dashboard, Documentation, FAQ).
 */

import { BookOpen, Layout, Database, Search } from 'lucide-react';
import type { PluginContent } from '../registry';

export const notionContent: PluginContent = {
  // ============================================
  // Landing Page
  // ============================================

  tagline: 'Notion Workspace Management via MCP',
  description:
    'Manage pages, databases, blocks, and comments in your Notion workspace through AI-powered MCP tools.',

  features: [
    {
      icon: <Layout className="h-6 w-6" />,
      title: 'Pages & Blocks',
      description:
        'Create, read, update, and delete Notion pages and their content blocks.',
    },
    {
      icon: <Database className="h-6 w-6" />,
      title: 'Data Sources & Databases',
      description:
        'Query, filter, and sort database content. Supports new 2025-09-03 data sources.',
    },
    {
      icon: <Search className="h-6 w-6" />,
      title: 'Search & Comments',
      description:
        'Search across your workspace and manage page comments and discussions.',
    },
  ],

  setupSteps: [
    {
      title: 'Create Integration',
      description:
        'Create an internal integration at notion.so/profile/integrations and copy the token.',
    },
    {
      title: 'Connect Pages',
      description:
        'Share your Notion pages/databases with the integration (page menu -> Connections).',
    },
  ],

  demoCode: `> Search my Notion workspace for "Project Plan"

Found 3 results:
1. "Q1 Project Plan" (page) - last edited 2 hours ago
2. "Project Plan Template" (database) - 45 pages
3. "Project Plan Archive" (page) - archived

> Query the Tasks database for items assigned to me

Found 8 tasks:
- "Design API schema" - Status: In Progress
- "Write documentation" - Status: Not Started
- "Review PR #42" - Status: Done

> Add a comment on "Design API schema": "Updated the draft"

Comment created successfully.`,

  externalDocUrl: 'https://developers.notion.com',

  // ============================================
  // Dashboard
  // ============================================

  quickStartSteps: [
    'Create an internal integration at notion.so/profile/integrations',
    'Copy the integration token (starts with secret_ or ntn_)',
    'Share your Notion pages with the integration',
    'Add a connection here with your token',
    'Start managing your Notion workspace via MCP!',
  ],

  emptyConnectionCTA: 'Add your first Notion connection',

  // ============================================
  // Documentation
  // ============================================

  connectionGuide: (
    <>
      <p className="text-n2f-text-secondary mb-4">
        Go to <strong>Connections</strong> and add your Notion integration token:
      </p>
      <ul className="list-disc pl-6 space-y-2 text-n2f-text-secondary mb-4">
        <li>
          <strong className="text-n2f-text">Name:</strong> A friendly name (e.g., "My Workspace")
        </li>
        <li>
          <strong className="text-n2f-text">Integration Token:</strong> Your internal integration
          token from{' '}
          <a
            href="https://www.notion.so/profile/integrations"
            target="_blank"
            rel="noopener noreferrer"
            className="text-n2f-accent hover:underline"
          >
            Notion Integrations
          </a>
        </li>
      </ul>
      <div className="bg-amber-900/20 border border-amber-700/50 rounded-lg p-3 text-sm text-amber-300">
        <strong>Important:</strong> After creating the integration, you must share each page/database
        with it via the page menu -&gt; Connections -&gt; Add connection.
      </div>
    </>
  ),

  examplePrompts: [
    'Search my workspace for "Meeting Notes"',
    'List all pages in my Tasks database',
    'Create a new page in my Projects database',
    'Add a paragraph to page [ID]',
    'Query tasks where status is "In Progress"',
    'Add a comment on this page',
  ],

  mcpConfigName: 'notion',

  configSections: (
    <>
      <section>
        <h2 className="text-xl font-semibold text-n2f-text mb-4">
          Workflow: Pages, Blocks, Databases
        </h2>
        <div className="grid sm:grid-cols-3 gap-3">
          <div className="bg-n2f-card border border-n2f-border rounded-lg p-3">
            <div className="flex items-center gap-2 mb-2">
              <Layout className="h-4 w-4 text-n2f-accent" />
              <span className="text-n2f-text font-medium">1. Create Pages</span>
            </div>
            <p className="text-sm text-n2f-text-secondary">
              Use <code className="bg-n2f-elevated px-1 rounded">notion_create_page</code> to add
              pages to databases or as sub-pages.
            </p>
          </div>
          <div className="bg-n2f-card border border-n2f-border rounded-lg p-3">
            <div className="flex items-center gap-2 mb-2">
              <BookOpen className="h-4 w-4 text-n2f-accent" />
              <span className="text-n2f-text font-medium">2. Add Content</span>
            </div>
            <p className="text-sm text-n2f-text-secondary">
              Use <code className="bg-n2f-elevated px-1 rounded">notion_append_blocks</code> to add
              paragraphs, headings, lists, code blocks, and more.
            </p>
          </div>
          <div className="bg-n2f-card border border-n2f-border rounded-lg p-3">
            <div className="flex items-center gap-2 mb-2">
              <Database className="h-4 w-4 text-n2f-accent" />
              <span className="text-n2f-text font-medium">3. Query Data</span>
            </div>
            <p className="text-sm text-n2f-text-secondary">
              Use{' '}
              <code className="bg-n2f-elevated px-1 rounded">notion_query_data_source</code> to
              filter and sort database pages.
            </p>
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-n2f-text mb-4">API Versions</h2>
        <div className="grid sm:grid-cols-2 gap-3">
          <div className="bg-n2f-card border border-n2f-border rounded-lg p-3">
            <span className="text-n2f-text font-medium">2025-09-03 (Latest)</span>
            <p className="text-sm text-n2f-text-secondary mt-1">
              Data Sources API, move pages, improved search. Use{' '}
              <code className="bg-n2f-elevated px-1 rounded">notion_*_data_source</code> tools.
            </p>
          </div>
          <div className="bg-n2f-card border border-n2f-border rounded-lg p-3">
            <span className="text-n2f-text font-medium">Legacy Database Endpoints</span>
            <p className="text-sm text-n2f-text-secondary mt-1">
              Still available for backward compatibility. Use{' '}
              <code className="bg-n2f-elevated px-1 rounded">notion_*_database</code> tools.
            </p>
          </div>
        </div>
      </section>
    </>
  ),

  // ============================================
  // FAQ
  // ============================================

  faqCategories: [
    {
      name: 'Notion',
      icon: <BookOpen className="h-5 w-5" />,
      items: [
        {
          question: 'How do I get a Notion integration token?',
          answer: (
            <ol className="list-decimal pl-5 space-y-2">
              <li>
                Go to{' '}
                <a
                  href="https://www.notion.so/profile/integrations"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-n2f-accent hover:underline"
                >
                  Notion Integrations
                </a>
              </li>
              <li>Click <strong>New integration</strong></li>
              <li>Name it and select your workspace</li>
              <li>Copy the <strong>Internal Integration Secret</strong></li>
              <li>Share pages/databases with the integration via Connections menu</li>
            </ol>
          ),
        },
        {
          question: "Why can't the integration see my pages?",
          answer: (
            <div className="space-y-2">
              <p>Notion integrations can only access pages explicitly shared with them:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Open the page or database in Notion</li>
                <li>Click the <strong>...</strong> menu (top right)</li>
                <li>Select <strong>Connections</strong> &gt; <strong>Add connections</strong></li>
                <li>Find and select your integration</li>
                <li>Child pages inherit access from parent pages</li>
              </ul>
            </div>
          ),
        },
        {
          question: 'What is the difference between Data Sources and Databases?',
          answer: (
            <div className="space-y-2">
              <p>Starting with API version 2025-09-03:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li><strong>Database</strong> is the container (like a folder for tables)</li>
                <li><strong>Data Source</strong> is the actual table with properties and pages</li>
                <li>A database can now have multiple data sources (views/tables)</li>
                <li>Legacy database endpoints still work for single-table databases</li>
              </ul>
            </div>
          ),
        },
        {
          question: 'Is my integration token secure?',
          answer: (
            <div className="space-y-2">
              <p>Yes, your token is protected:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Encrypted with <strong>AES-256-GCM</strong> before storage</li>
                <li>Only decrypted when proxying requests to the Notion API</li>
                <li>Tokens can be regenerated anytime from Notion Integrations</li>
                <li>All communications use HTTPS/TLS encryption</li>
              </ul>
            </div>
          ),
        },
      ],
    },
  ],
};
