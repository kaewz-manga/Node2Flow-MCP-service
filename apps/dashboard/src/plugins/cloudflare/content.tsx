/**
 * Cloudflare Plugin Content
 * All Cloudflare-specific content used by global pages (Landing, Dashboard, Documentation, FAQ).
 */

import { Cloud, Database, Eye } from 'lucide-react';
import type { PluginContent } from '../registry';

export const cloudflareContent: PluginContent = {
  // ============================================
  // Landing Page
  // ============================================

  tagline: 'Manage Cloudflare with AI',
  description:
    'Control your Cloudflare infrastructure through AI. Manage Workers, KV, R2, D1, and 15 services via MCP.',

  features: [
    {
      icon: <Cloud className="h-6 w-6" />,
      title: 'Workers & Bindings',
      description:
        'Deploy Workers, manage KV namespaces, R2 buckets, D1 databases, and Hyperdrive configs.',
    },
    {
      icon: <Eye className="h-6 w-6" />,
      title: 'Observability & Logs',
      description:
        'Query worker logs, view analytics, audit logs, DNS analytics, and performance metrics.',
    },
    {
      icon: <Database className="h-6 w-6" />,
      title: '15 MCP Services',
      description:
        'Docs, Bindings, Builds, Observability, Radar, Containers, Browser, Logpush, AI Gateway, AutoRAG, and more.',
    },
  ],

  setupSteps: [
    {
      title: 'Connect Cloudflare',
      description:
        'Add your Cloudflare API token and account ID. Your credentials are encrypted and securely stored.',
    },
  ],

  demoCode: `> List my Cloudflare Workers

Found 3 Workers in your account:
1. api-gateway (production)
2. auth-service (production)
3. image-resizer (staging)

> Query D1 database "users-db" for recent signups

SELECT * FROM users WHERE created_at > '2026-02-01'

| id  | email              | plan  | created_at |
|-----|--------------------|-------|------------|
| 42  | user@example.com   | pro   | 2026-02-05 |
| 43  | dev@company.com    | free  | 2026-02-07 |`,

  externalDocUrl: 'https://developers.cloudflare.com',

  // ============================================
  // Dashboard
  // ============================================

  quickStartSteps: [
    'Create an API token at Cloudflare Dashboard',
    'Add a connection with your token and account ID',
    'Copy the generated Service API key',
    'Start managing Cloudflare infrastructure with AI!',
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
          <strong className="text-foreground">Name:</strong> A friendly name (e.g., "My CF Account")
        </li>
        <li>
          <strong className="text-foreground">API Token:</strong> Created at{' '}
          <a
            href="https://dash.cloudflare.com/profile/api-tokens"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            Cloudflare Dashboard &gt; API Tokens
          </a>
        </li>
        <li>
          <strong className="text-foreground">Account ID:</strong> Found on any zone overview page
          (required for Workers, KV, R2, D1)
        </li>
      </ul>
    </>
  ),

  examplePrompts: [
    'List my Cloudflare Workers',
    'Create a KV namespace called "cache"',
    'Query my D1 database for user stats',
    'Search Cloudflare docs for R2 presigned URLs',
  ],

  mcpConfigName: 'cloudflare',

  configSections: (
    <>
      <section>
        <h2 className="text-xl font-semibold text-foreground mb-4">15 Cloudflare Services</h2>
        <p className="text-muted-foreground mb-3">
          The Cloudflare plugin routes your requests to the correct service automatically:
        </p>
        <div className="grid sm:grid-cols-3 gap-3">
          <div className="bg-card border border-border rounded-lg p-3">
            <span className="text-foreground font-medium">Core</span>
            <p className="text-sm text-muted-foreground mt-1">
              Workers Bindings, Builds, Docs
            </p>
          </div>
          <div className="bg-card border border-border rounded-lg p-3">
            <span className="text-foreground font-medium">Data & Storage</span>
            <p className="text-sm text-muted-foreground mt-1">
              KV, R2, D1, Hyperdrive
            </p>
          </div>
          <div className="bg-card border border-border rounded-lg p-3">
            <span className="text-foreground font-medium">Intelligence</span>
            <p className="text-sm text-muted-foreground mt-1">
              Observability, Radar, AI Gateway, AutoRAG
            </p>
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-foreground mb-4">API Token Permissions</h2>
        <p className="text-muted-foreground mb-3">
          Create an API token with permissions matching the services you want to use:
        </p>
        <div className="grid sm:grid-cols-2 gap-3">
          <div className="bg-card border border-border rounded-lg p-3">
            <span className="text-foreground font-medium">Workers & Storage</span>
            <p className="text-sm text-muted-foreground mt-1">
              Workers Scripts:Edit, Workers KV:Edit, Workers R2:Edit, D1:Edit
            </p>
          </div>
          <div className="bg-card border border-border rounded-lg p-3">
            <span className="text-foreground font-medium">Analytics & Logs</span>
            <p className="text-sm text-muted-foreground mt-1">
              Analytics:Read, Logs:Read, Audit Logs:Read
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
      name: 'Cloudflare',
      icon: <Cloud className="h-5 w-5" />,
      items: [
        {
          question: 'How do I create a Cloudflare API token?',
          answer: (
            <ol className="list-decimal pl-5 space-y-2">
              <li>
                Go to{' '}
                <a
                  href="https://dash.cloudflare.com/profile/api-tokens"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  Cloudflare Dashboard &gt; API Tokens
                </a>
              </li>
              <li>Click <strong>Create Token</strong></li>
              <li>Choose a template or create a custom token</li>
              <li>Add permissions for the services you need</li>
              <li>Copy the generated token</li>
            </ol>
          ),
        },
        {
          question: 'Is my API token secure?',
          answer: (
            <div className="space-y-2">
              <p>Yes, we take security seriously:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>
                  Your API token is <strong>encrypted with AES-256-GCM</strong> before storage
                </li>
                <li>We only decrypt when proxying requests to Cloudflare</li>
                <li>All communications use HTTPS/TLS encryption</li>
              </ul>
            </div>
          ),
        },
        {
          question: 'What Cloudflare services can I manage?',
          answer: (
            <div className="space-y-2">
              <p>The Cloudflare plugin provides 91 tools across 15 services:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>
                  <strong>Workers</strong> - Deploy, manage, and monitor Workers
                </li>
                <li>
                  <strong>KV, R2, D1</strong> - Key-value, object storage, and SQL databases
                </li>
                <li>
                  <strong>Observability</strong> - Logs, metrics, and traces
                </li>
                <li>
                  <strong>Radar</strong> - Internet intelligence and traffic analytics
                </li>
                <li>
                  <strong>AI Gateway & AutoRAG</strong> - AI model routing and RAG
                </li>
                <li>
                  <strong>Security</strong> - Audit logs, CASB, DEX
                </li>
              </ul>
            </div>
          ),
        },
        {
          question: 'Where do I find my Account ID?',
          answer: (
            <div className="space-y-2">
              <p>Your Cloudflare Account ID can be found in several places:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>On any zone overview page in the right sidebar</li>
                <li>In the URL when viewing your dashboard: <code className="bg-muted px-1 rounded">dash.cloudflare.com/ACCOUNT_ID</code></li>
                <li>Via the API: <code className="bg-muted px-1 rounded">cf_accounts_list</code> tool</li>
              </ul>
              <p className="text-sm text-muted-foreground">
                Account ID is required for account-scoped services like Workers, KV, R2, and D1.
              </p>
            </div>
          ),
        },
      ],
    },
  ],
};
