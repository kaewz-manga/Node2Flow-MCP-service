/**
 * Cloudflare Plugin Content
 * All Cloudflare-specific content used by global pages (Landing, Dashboard, Documentation, FAQ).
 */

import { Cloud, Database, HardDrive, BookOpen } from 'lucide-react';
import type { PluginContent } from '../registry';

export const cloudflareContent: PluginContent = {
  // ============================================
  // Landing Page
  // ============================================

  tagline: 'Manage Cloudflare Developer Platform with AI',
  description:
    'Manage Workers, D1 databases, KV namespaces, R2 buckets, and Hyperdrive configurations through the Cloudflare API.',

  features: [
    {
      icon: <Cloud className="h-6 w-6" />,
      title: 'Workers & Code',
      description:
        'List Workers, view metadata, and download source code. Manage your serverless edge compute.',
    },
    {
      icon: <Database className="h-6 w-6" />,
      title: 'D1, KV & R2',
      description:
        'Create and query D1 databases, manage KV namespaces, and control R2 object storage buckets.',
    },
    {
      icon: <HardDrive className="h-6 w-6" />,
      title: 'Hyperdrive & Docs',
      description:
        'Configure Hyperdrive database acceleration and search Cloudflare developer documentation.',
    },
  ],

  setupSteps: [
    {
      title: 'Create an API Token',
      description:
        'Go to Cloudflare Dashboard > My Profile > API Tokens. Create a token with the permissions you need (Account, Workers, D1, KV, R2).',
    },
  ],

  demoCode: `> List all Workers in my account

Found 8 Workers:
- mcp-gateway (modified 2h ago)
- platform-api (modified 1d ago)
...

> Query D1 database for users

SELECT * FROM users LIMIT 5;
┌─────┬───────────────┬──────────┐
│ id  │ email         │ plan     │
├─────┼───────────────┼──────────┤
│ 1   │ user@test.com │ pro      │
│ 2   │ dev@demo.com  │ free     │
└─────┴───────────────┴──────────┘

> Create a new KV namespace

Created: SESSION_STORE (id: abc123...)

> List R2 buckets

2 buckets:
- app-assets (created Jan 2026)
- backups (created Dec 2025)`,

  externalDocUrl: 'https://developers.cloudflare.com',

  // ============================================
  // Dashboard
  // ============================================

  quickStartSteps: [
    'Create an API Token in Cloudflare Dashboard',
    'Add a connection with your token and Account ID',
    'Copy the generated API key',
    'Manage Workers, D1, KV, and R2 with AI!',
  ],

  emptyConnectionCTA: 'Add your first Cloudflare connection',

  // ============================================
  // Documentation
  // ============================================

  connectionGuide: (
    <>
      <p className="text-muted-foreground mb-4">
        Go to <strong>Connections</strong> and add your Cloudflare credentials:
      </p>
      <ul className="list-disc pl-6 space-y-2 text-muted-foreground mb-4">
        <li>
          <strong className="text-foreground">Name:</strong> A friendly name (e.g., "My Cloudflare")
        </li>
        <li>
          <strong className="text-foreground">API Token:</strong> From Cloudflare Dashboard &gt; My Profile &gt; API Tokens
        </li>
        <li>
          <strong className="text-foreground">Account ID (optional):</strong> Found in Cloudflare Dashboard sidebar. Can also be set later with cf_set_active_account.
        </li>
      </ul>
    </>
  ),

  examplePrompts: [
    'List all Workers in my account',
    'Query the users table in my D1 database',
    'Create a new KV namespace called RATE_LIMIT',
    'List all R2 buckets',
    'Get the source code of my mcp-gateway Worker',
    'Search Cloudflare docs for D1 bindings',
  ],

  mcpConfigName: 'cloudflare',

  // ============================================
  // FAQ
  // ============================================

  faqCategories: [
    {
      name: 'Cloudflare',
      icon: <BookOpen className="h-5 w-5" />,
      items: [
        {
          question: 'How do I create an API Token?',
          answer: (
            <div className="space-y-2">
              <ol className="list-decimal pl-5 space-y-1">
                <li>Go to <strong>Cloudflare Dashboard</strong> &gt; My Profile &gt; API Tokens</li>
                <li>Click <strong>Create Token</strong></li>
                <li>Select a template or create custom with needed permissions</li>
                <li>For full access: Account &gt; Workers Scripts (Edit), D1 (Edit), Workers KV (Edit), R2 (Edit)</li>
              </ol>
            </div>
          ),
        },
        {
          question: 'What tools are available?',
          answer: (
            <div className="space-y-2">
              <p>25 tools across 7 categories:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li><strong>Accounts (2)</strong> — List accounts, set active account</li>
                <li><strong>Workers (3)</strong> — List, get metadata, download source code</li>
                <li><strong>D1 Databases (5)</strong> — List, create, get, delete, query with SQL</li>
                <li><strong>KV Namespaces (5)</strong> — List, create, get, rename, delete</li>
                <li><strong>R2 Buckets (4)</strong> — List, create, get, delete</li>
                <li><strong>Hyperdrive (4)</strong> — List, get, edit, delete configs</li>
                <li><strong>Documentation (2)</strong> — Search docs, migration guide</li>
              </ul>
            </div>
          ),
        },
        {
          question: 'Do I need to set an Account ID?',
          answer: (
            <div className="space-y-2">
              <p>Most tools require an Account ID. You can either:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Set it in the connection config (recommended)</li>
                <li>Use <code className="bg-muted px-1 rounded">cf_list_accounts</code> then <code className="bg-muted px-1 rounded">cf_set_active_account</code> at runtime</li>
              </ul>
            </div>
          ),
        },
      ],
    },
  ],
};
