/**
 * PostgREST Plugin Content
 * All PostgREST-specific content used by global pages (Landing, Dashboard, Documentation, FAQ).
 */

import { Database, Table2, Code } from 'lucide-react';
import type { PluginContent } from '../registry';

export const postgrestContent: PluginContent = {
  // ============================================
  // Landing Page
  // ============================================

  tagline: 'Query Any PostgREST Server with AI',
  description:
    'Explore schemas, query records, call functions, and manage data on any PostgREST-compatible API through natural language.',

  features: [
    {
      icon: <Database className="h-6 w-6" />,
      title: 'Schema Discovery',
      description:
        'Get the full OpenAPI schema and describe individual tables to understand your database structure.',
    },
    {
      icon: <Table2 className="h-6 w-6" />,
      title: 'Data Operations',
      description:
        'List, insert, update, upsert, delete, and replace records with PostgREST filtering and pagination.',
    },
    {
      icon: <Code className="h-6 w-6" />,
      title: 'RPC Functions',
      description:
        'Call PostgreSQL functions and stored procedures via the RPC endpoint with full parameter support.',
    },
  ],

  setupSteps: [
    {
      title: 'Connect PostgREST',
      description:
        'Add your PostgREST server URL and optional JWT token. Your credentials are encrypted and securely stored.',
    },
  ],

  demoCode: `> Show me the database schema

Tables: users, orders, products, categories
Views: active_users, order_summary

> List orders where status = "pending" sorted by created_at desc

Found 12 records:
- Order #1042 - $299.00 (pending)
- Order #1038 - $149.50 (pending)
...

> Call function calculate_total with order_id = 1042

Result: { "total": 299.00, "tax": 23.92, "grand_total": 322.92 }`,

  externalDocUrl: 'https://postgrest.org/en/stable/',

  // ============================================
  // Dashboard
  // ============================================

  quickStartSteps: [
    'Get your PostgREST server URL (e.g., https://api.example.com)',
    'Optionally get a JWT token for authenticated access',
    'Add a connection with your URL and token',
    'Copy the generated API key',
    'Start querying your database with AI!',
  ],

  emptyConnectionCTA: 'Add your first PostgREST connection',

  // ============================================
  // Documentation
  // ============================================

  connectionGuide: (
    <>
      <p className="text-muted-foreground mb-4">
        Go to <strong>Connections</strong> and add your PostgREST server:
      </p>
      <ul className="list-disc pl-6 space-y-2 text-muted-foreground mb-4">
        <li>
          <strong className="text-foreground">Name:</strong> A friendly name (e.g., "Production DB")
        </li>
        <li>
          <strong className="text-foreground">PostgREST URL:</strong> Your server base URL (e.g., <code className="bg-muted px-1 rounded">https://api.example.com</code>)
        </li>
        <li>
          <strong className="text-foreground">JWT Token:</strong> Optional — required if your PostgREST server uses JWT authentication
        </li>
      </ul>
    </>
  ),

  examplePrompts: [
    'Show me the database schema',
    'List all users where role is admin',
    'Insert a new product with name "Widget"',
    'Call function get_user_stats with user_id = 1',
  ],

  mcpConfigName: 'postgrest',

  // ============================================
  // FAQ
  // ============================================

  faqCategories: [
    {
      name: 'PostgREST Connection',
      icon: <Database className="h-5 w-5" />,
      items: [
        {
          question: 'What is PostgREST?',
          answer: (
            <div className="space-y-2">
              <p>
                <a
                  href="https://postgrest.org/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  PostgREST
                </a>{' '}
                turns your PostgreSQL database into a RESTful API automatically. Services like{' '}
                <strong>Supabase</strong> use PostgREST under the hood.
              </p>
            </div>
          ),
        },
        {
          question: 'Do I need a JWT token?',
          answer: (
            <div className="space-y-2">
              <p>It depends on your PostgREST configuration:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li><strong>Public access</strong> — No token needed if your server allows anonymous access</li>
                <li><strong>Authenticated access</strong> — Provide a JWT token to access protected tables/views</li>
                <li>The token is sent as a Bearer token in the Authorization header</li>
              </ul>
            </div>
          ),
        },
        {
          question: 'What PostgREST features can I access via MCP?',
          answer: (
            <div className="space-y-2">
              <p>The PostgREST plugin provides 10 tools covering:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li><strong>Schema</strong> - Get OpenAPI schema, describe table columns</li>
                <li><strong>Read</strong> - List records with filters, count records, call RPC functions</li>
                <li><strong>Write</strong> - Insert, update, upsert, delete, replace records</li>
              </ul>
            </div>
          ),
        },
      ],
    },
  ],
};
