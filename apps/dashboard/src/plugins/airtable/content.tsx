/**
 * Airtable Plugin Content
 * All Airtable-specific content used by global pages (Landing, Dashboard, Documentation, FAQ).
 */

import { Table2, Database, Webhook } from 'lucide-react';
import type { PluginContent } from '../registry';

export const airtableContent: PluginContent = {
  // ============================================
  // Landing Page
  // ============================================

  tagline: 'Manage Airtable Bases with AI',
  description:
    'Browse records, manage schema, create webhooks, and interact with your Airtable bases through natural language.',

  features: [
    {
      icon: <Table2 className="h-6 w-6" />,
      title: 'Record Management',
      description:
        'List, create, update, delete, and upsert records across any table with filtering and sorting.',
    },
    {
      icon: <Database className="h-6 w-6" />,
      title: 'Schema & Bases',
      description:
        'Browse bases, view table schemas, create tables and fields, and manage your database structure.',
    },
    {
      icon: <Webhook className="h-6 w-6" />,
      title: 'Webhooks',
      description:
        'Create, list, refresh, and delete webhooks to receive real-time notifications on data changes.',
    },
  ],

  setupSteps: [
    {
      title: 'Connect Airtable',
      description:
        'Add your Personal Access Token from Airtable. Your token is encrypted and securely stored.',
    },
  ],

  demoCode: `> List all bases in my account

Found 3 bases:
1. Project Tracker (appXYZ123)
2. CRM (appABC456)
3. Inventory (appDEF789)

> List records from "Tasks" table where Status = "In Progress"

Found 5 records:
- Task: Build dashboard (Priority: High)
- Task: Write tests (Priority: Medium)
...

> Create a new record in Tasks with name "Deploy v2"

Record created successfully!
ID: rec123ABC`,

  externalDocUrl: 'https://airtable.com/developers/web/api/introduction',

  // ============================================
  // Dashboard
  // ============================================

  quickStartSteps: [
    'Go to airtable.com/create/tokens and create a Personal Access Token',
    'Grant scopes: data.records:read, data.records:write, schema.bases:read, schema.bases:write',
    'Add a connection with your token',
    'Copy the generated API key',
    'Start managing your Airtable bases with AI!',
  ],

  emptyConnectionCTA: 'Add your first Airtable connection',

  // ============================================
  // Documentation
  // ============================================

  connectionGuide: (
    <>
      <p className="text-muted-foreground mb-4">
        Go to <strong>Connections</strong> and add your Airtable account:
      </p>
      <ul className="list-disc pl-6 space-y-2 text-muted-foreground mb-4">
        <li>
          <strong className="text-foreground">Name:</strong> A friendly name (e.g., "My Airtable")
        </li>
        <li>
          <strong className="text-foreground">Personal Access Token:</strong> From{' '}
          <a
            href="https://airtable.com/create/tokens"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            airtable.com/create/tokens
          </a>
        </li>
      </ul>
    </>
  ),

  examplePrompts: [
    'List all bases in my account',
    'Show records from the Tasks table',
    'Create a new record with name "Meeting notes"',
    'Get the schema for my CRM base',
  ],

  mcpConfigName: 'airtable',

  // ============================================
  // FAQ
  // ============================================

  faqCategories: [
    {
      name: 'Airtable Connection',
      icon: <Table2 className="h-5 w-5" />,
      items: [
        {
          question: 'How do I get a Personal Access Token?',
          answer: (
            <ol className="list-decimal pl-5 space-y-2">
              <li>
                Go to{' '}
                <a
                  href="https://airtable.com/create/tokens"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  airtable.com/create/tokens
                </a>
              </li>
              <li>Click "Create new token"</li>
              <li>Add scopes: data.records:read, data.records:write, schema.bases:read, schema.bases:write, webhook:manage</li>
              <li>Select the bases you want to access (or all bases)</li>
              <li>Copy the generated token (starts with <code className="bg-muted px-1 rounded">pat...</code>)</li>
            </ol>
          ),
        },
        {
          question: 'Is my token secure?',
          answer: (
            <div className="space-y-2">
              <p>Yes, we take security seriously:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Your token is <strong>encrypted with AES-256-GCM</strong> before storage</li>
                <li>We only decrypt when proxying requests to Airtable API</li>
                <li>Tokens can be revoked anytime from Airtable settings</li>
                <li>All communications use HTTPS/TLS encryption</li>
              </ul>
            </div>
          ),
        },
        {
          question: 'What Airtable features can I access via MCP?',
          answer: (
            <div className="space-y-2">
              <p>The Airtable plugin provides 18 tools covering:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li><strong>Records</strong> - List, get, create, update, delete, upsert</li>
                <li><strong>Bases & Schema</strong> - List bases, get schema, create bases/tables/fields</li>
                <li><strong>Webhooks</strong> - Create, list, refresh, view payloads, delete</li>
              </ul>
            </div>
          ),
        },
      ],
    },
  ],
};
