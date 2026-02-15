/**
 * SQLite Plugin Content
 * All SQLite-specific content used by global pages (Landing, Dashboard, Documentation, FAQ).
 */

import { Database, Table2, Wrench } from 'lucide-react';
import type { PluginContent } from '../registry';

export const sqliteContent: PluginContent = {
  // ============================================
  // Landing Page
  // ============================================

  tagline: 'Manage SQLite Databases with AI',
  description:
    'Query, manage schemas, create indexes, and maintain SQLite or Turso databases through natural language.',

  features: [
    {
      icon: <Database className="h-6 w-6" />,
      title: 'Query & Execute',
      description:
        'Run SELECT queries, INSERT/UPDATE/DELETE statements, and multi-statement scripts with parameter binding.',
    },
    {
      icon: <Table2 className="h-6 w-6" />,
      title: 'Schema Management',
      description:
        'Create, alter, and drop tables. Manage indexes and inspect foreign key relationships.',
    },
    {
      icon: <Wrench className="h-6 w-6" />,
      title: 'Database Maintenance',
      description:
        'Get database info, run VACUUM to optimize, and perform integrity checks to verify health.',
    },
  ],

  setupSteps: [
    {
      title: 'Connect Database',
      description:
        'Add your libSQL/Turso database URL and optional auth token. Your credentials are encrypted and securely stored.',
    },
  ],

  demoCode: `> List all tables in the database

Tables: users (1,024 rows), orders (5,891 rows), products (256 rows)

> Describe the users table

Columns: id (INTEGER, PK), name (TEXT, NOT NULL), email (TEXT, UNIQUE), created_at (TEXT)

> SELECT * FROM users WHERE name LIKE '%John%' LIMIT 5

Found 3 rows:
- id: 1, name: John Doe, email: john@example.com
- id: 42, name: Johnny Smith, email: johnny@example.com
...

> Run integrity check

Result: { "ok": true, "results": ["ok"] }`,

  externalDocUrl: 'https://docs.turso.tech/',

  // ============================================
  // Dashboard
  // ============================================

  quickStartSteps: [
    'Get your libSQL/Turso database URL (e.g., libsql://db-name-org.turso.io)',
    'Create an auth token in Turso dashboard (or use your libSQL server token)',
    'Add a connection with your URL and token',
    'Copy the generated API key',
    'Start querying your database with AI!',
  ],

  emptyConnectionCTA: 'Add your first SQLite connection',

  // ============================================
  // Documentation
  // ============================================

  connectionGuide: (
    <>
      <p className="text-muted-foreground mb-4">
        Go to <strong>Connections</strong> and add your database:
      </p>
      <ul className="list-disc pl-6 space-y-2 text-muted-foreground mb-4">
        <li>
          <strong className="text-foreground">Name:</strong> A friendly name (e.g., "Production DB")
        </li>
        <li>
          <strong className="text-foreground">Database URL:</strong> Your libSQL/Turso URL (e.g., <code className="bg-muted px-1 rounded">libsql://db-name-org.turso.io</code>)
        </li>
        <li>
          <strong className="text-foreground">Auth Token:</strong> Optional — required for Turso cloud databases
        </li>
      </ul>
    </>
  ),

  examplePrompts: [
    'List all tables in the database',
    'Describe the users table',
    'SELECT * FROM orders WHERE status = "pending" LIMIT 10',
    'Create a table called logs with columns: id, message, level, created_at',
    'Run integrity check on the database',
  ],

  mcpConfigName: 'sqlite',

  // ============================================
  // FAQ
  // ============================================

  faqCategories: [
    {
      name: 'SQLite Connection',
      icon: <Database className="h-5 w-5" />,
      items: [
        {
          question: 'What databases are supported?',
          answer: (
            <div className="space-y-2">
              <p>The SQLite plugin supports remote databases via the libSQL protocol:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li><strong>Turso</strong> — Managed SQLite-compatible database (<code className="bg-muted px-1 rounded">libsql://</code> URLs)</li>
                <li><strong>libSQL Server</strong> — Self-hosted libSQL instances</li>
                <li><strong>sqld</strong> — The libSQL server daemon</li>
              </ul>
              <p>Local SQLite files are not supported in the cloud version — use the npm package for local databases.</p>
            </div>
          ),
        },
        {
          question: 'Do I need an auth token?',
          answer: (
            <div className="space-y-2">
              <p>It depends on your setup:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li><strong>Turso cloud</strong> — Yes, create a token in the Turso dashboard</li>
                <li><strong>Self-hosted libSQL</strong> — Only if your server requires authentication</li>
              </ul>
            </div>
          ),
        },
        {
          question: 'What tools are available?',
          answer: (
            <div className="space-y-2">
              <p>The SQLite plugin provides 15 tools across 5 categories:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li><strong>Query & Execute</strong> — SELECT queries, write statements, multi-statement scripts</li>
                <li><strong>Schema Inspection</strong> — List tables, describe columns, list indexes and foreign keys</li>
                <li><strong>Schema Management</strong> — Create/alter/drop tables</li>
                <li><strong>Index Management</strong> — Create/drop indexes</li>
                <li><strong>Database Maintenance</strong> — Get info, vacuum, integrity check</li>
              </ul>
            </div>
          ),
        },
      ],
    },
  ],
};
