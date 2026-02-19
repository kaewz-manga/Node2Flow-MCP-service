/**
 * Supabase Plugin Content
 * All Supabase-specific content used by global pages (Landing, Dashboard, Documentation, FAQ).
 */

import { Database, Shield, Cloud } from 'lucide-react';
import type { PluginContent } from '../registry';

export const supabaseContent: PluginContent = {
  // ============================================
  // Landing Page
  // ============================================

  tagline: 'Manage Supabase Projects with AI',
  description:
    'Full Supabase management — database CRUD, storage, auth admin, project management, edge functions, and secrets — all through natural language.',

  features: [
    {
      icon: <Database className="h-6 w-6" />,
      title: 'Database & Storage',
      description:
        'CRUD operations on any table, call RPC functions, manage storage buckets and objects with signed URLs.',
    },
    {
      icon: <Shield className="h-6 w-6" />,
      title: 'Auth Administration',
      description:
        'List, create, update, and delete users. Manage authentication settings from your Supabase project.',
    },
    {
      icon: <Cloud className="h-6 w-6" />,
      title: 'Project Management',
      description:
        'List projects, run SQL queries, manage migrations, edge functions, secrets, and API keys via the Management API.',
    },
  ],

  setupSteps: [
    {
      title: 'Connect Supabase',
      description:
        'Add your Supabase project URL and Service Role Key for database/storage/auth. Optionally add an Access Token for project management.',
    },
  ],

  demoCode: `> List all users from the profiles table

Found 24 records in profiles:
- user_1: John Doe (admin)
- user_2: Jane Smith (member)
...

> Upload a file to the avatars bucket

Uploaded: avatars/user_1.png (signed URL valid 1h)

> List all Supabase projects

Projects: my-app (active), staging-env (paused)

> Run SQL: SELECT count(*) FROM orders WHERE status = 'pending'

Result: [{ "count": 42 }]`,

  externalDocUrl: 'https://supabase.com/docs',

  // ============================================
  // Dashboard
  // ============================================

  quickStartSteps: [
    'Get your Supabase project URL from the dashboard (Settings > API)',
    'Copy the Service Role Key for database/storage/auth access',
    'Optionally get a Personal Access Token from supabase.com/dashboard/account/tokens',
    'Add a connection with your credentials',
    'Copy the generated API key',
    'Start managing your Supabase project with AI!',
  ],

  emptyConnectionCTA: 'Add your first Supabase connection',

  // ============================================
  // Documentation
  // ============================================

  connectionGuide: (
    <>
      <p className="text-muted-foreground mb-4">
        Go to <strong>Connections</strong> and add your Supabase project:
      </p>
      <ul className="list-disc pl-6 space-y-2 text-muted-foreground mb-4">
        <li>
          <strong className="text-foreground">Name:</strong> A friendly name (e.g., "Production")
        </li>
        <li>
          <strong className="text-foreground">Supabase URL:</strong> Your project URL (e.g., <code className="bg-muted px-1 rounded">https://xxx.supabase.co</code>)
        </li>
        <li>
          <strong className="text-foreground">Service Role Key:</strong> Found in Settings &gt; API &gt; Service Role Key — gives full access to database, storage, and auth
        </li>
        <li>
          <strong className="text-foreground">Access Token:</strong> Optional — a Personal Access Token from your Supabase account for project management operations
        </li>
      </ul>
    </>
  ),

  examplePrompts: [
    'List all records from the users table',
    'Insert a new product with name "Widget" and price 29.99',
    'Upload a file to the documents bucket',
    'List all Supabase projects in my account',
    'Run SQL query: SELECT * FROM orders LIMIT 10',
    'List edge functions for my project',
  ],

  mcpConfigName: 'supabase',

  // ============================================
  // FAQ
  // ============================================

  faqCategories: [
    {
      name: 'Supabase Connection',
      icon: <Database className="h-5 w-5" />,
      items: [
        {
          question: 'What credentials do I need?',
          answer: (
            <div className="space-y-2">
              <p>There are two levels of access:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li><strong>Project-level</strong> (Supabase URL + Service Role Key) — Access database tables, storage buckets, and auth users</li>
                <li><strong>Account-level</strong> (Access Token) — Manage projects, run SQL, view migrations, edge functions, and secrets</li>
              </ul>
              <p>You can provide both or just one depending on your needs.</p>
            </div>
          ),
        },
        {
          question: 'Where do I find my Service Role Key?',
          answer: (
            <div className="space-y-2">
              <p>In your Supabase dashboard:</p>
              <ol className="list-decimal pl-5 space-y-1">
                <li>Go to <strong>Settings</strong> &gt; <strong>API</strong></li>
                <li>Copy the <strong>service_role</strong> key (not the anon key)</li>
                <li>The project URL is shown at the top of the same page</li>
              </ol>
              <p className="text-yellow-400">Warning: The service role key bypasses Row Level Security. Keep it secure.</p>
            </div>
          ),
        },
        {
          question: 'What tools are available?',
          answer: (
            <div className="space-y-2">
              <p>The Supabase plugin provides 31 tools across 7 categories:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li><strong>Database REST</strong> — List, insert, update, upsert, delete records, call functions</li>
                <li><strong>Storage</strong> — List/create/delete buckets, list/delete objects, create signed URLs</li>
                <li><strong>Auth Admin</strong> — List, get, create, update, delete users</li>
                <li><strong>Projects</strong> — List, get, create, pause, restore projects</li>
                <li><strong>Database Management</strong> — Run SQL queries, list migrations, get TypeScript types</li>
                <li><strong>Edge Functions</strong> — List and get function details</li>
                <li><strong>Secrets & Keys</strong> — List/create/delete secrets, list API keys</li>
              </ul>
            </div>
          ),
        },
      ],
    },
  ],
};
