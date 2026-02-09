/**
 * Notion Extended Plugin Content
 * Extended Notion API with full REST API (version 2025-09-03)
 */

import { BookOpen, Layout, Database, Search } from 'lucide-react';
import type { PluginContent } from '../registry';

export const notionExtendedContent: PluginContent = {
  tagline: 'Full Notion REST API via MCP',
  description:
    'Extended Notion plugin with 25 tools covering Search, Pages, Blocks, Data Sources, Databases, Comments, and Users — all via the latest Notion API (2025-09-03).',

  features: [
    {
      icon: <Layout className="h-6 w-6" />,
      title: 'Pages & Blocks',
      description:
        'Create, read, update, move, and delete Notion pages and content blocks with full property support.',
    },
    {
      icon: <Database className="h-6 w-6" />,
      title: 'Data Sources & Databases',
      description:
        'Query, create, and manage data sources (2025-09-03) and legacy databases with filtering and sorting.',
    },
    {
      icon: <Search className="h-6 w-6" />,
      title: 'Comments & Users',
      description:
        'Manage page comments and discussions. List users and get bot info.',
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

  demoCode: `> Search workspace for "Project Plan"

Found 3 results:
1. "Q1 Project Plan" (page) - last edited 2 hours ago
2. "Project Plan Template" (database) - 45 pages
3. "Project Plan Archive" (page) - archived

> Create a data source in my Tasks database

Data source created with properties:
- Title (title), Status (select), Assignee (people)

> List users in the workspace

Found 5 users:
- Alice (person), Bob (person), Project Bot (bot)`,

  externalDocUrl: 'https://developers.notion.com',

  quickStartSteps: [
    'Create an internal integration at notion.so/profile/integrations',
    'Copy the integration token (starts with secret_ or ntn_)',
    'Share your Notion pages with the integration',
    'Add a connection here with your token',
    'Start managing your Notion workspace via MCP!',
  ],

  emptyConnectionCTA: 'Add your first Notion Extended connection',

  connectionGuide: (
    <>
      <p className="text-muted-foreground mb-4">
        Go to <strong>Connections</strong> and add your Notion integration token:
      </p>
      <ul className="list-disc pl-6 space-y-2 text-muted-foreground mb-4">
        <li>
          <strong className="text-foreground">Name:</strong> A friendly name (e.g., "My Workspace")
        </li>
        <li>
          <strong className="text-foreground">Integration Token:</strong> Your internal integration
          token from{' '}
          <a
            href="https://www.notion.so/profile/integrations"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline"
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
    'Create a new data source in my Projects database',
    'Query tasks where status is "In Progress"',
    'Move page to a different parent',
    'List all comments on this page',
    'Get workspace users',
  ],

  mcpConfigName: 'notion-extended',

  faqCategories: [
    {
      name: 'Notion Extended',
      icon: <BookOpen className="h-5 w-5" />,
      items: [
        {
          question: 'What is the difference between Notion and Notion Extended?',
          answer: (
            <div className="space-y-2">
              <p>Notion Extended provides 25 tools with the full Notion REST API (2025-09-03):</p>
              <ul className="list-disc pl-5 space-y-1">
                <li><strong>Data Sources</strong> — Create, query, update data sources and templates</li>
                <li><strong>Comments</strong> — Create, get, and list comments with discussion support</li>
                <li><strong>Users</strong> — List users, get user info, get bot user</li>
                <li><strong>Move Pages</strong> — Move pages between parents</li>
                <li><strong>Legacy Databases</strong> — Query and create databases (backward compatible)</li>
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
