/**
 * n8n Plugin Content
 * All n8n-specific content used by global pages (Landing, Dashboard, Documentation, FAQ).
 * Adding a new product = create a similar file, no need to touch global pages.
 */

import { Shield, Code } from 'lucide-react';
import type { PluginContent } from '../registry';

export const n8nContent: PluginContent = {
  // ============================================
  // Landing Page
  // ============================================

  tagline: 'Control n8n with AI',
  description:
    'Connect your AI assistant to n8n automation. Let Claude, Cursor, or any MCP-compatible client manage your workflows, executions, and more.',

  features: [
    {
      icon: <Code className="h-6 w-6" />,
      title: 'Full n8n API Access',
      description:
        'Workflows, executions, credentials, tags, variables, and users - all accessible through MCP.',
    },
  ],

  setupSteps: [
    {
      title: 'Connect n8n',
      description:
        "Add your n8n instance URL and API key. We'll encrypt and securely store your credentials.",
    },
  ],

  demoCode: `> List all my n8n workflows

I found 5 workflows in your n8n instance:

1. Email Newsletter (active)
2. Slack Notifications (active)
3. Data Sync Pipeline (inactive)
4. Customer Onboarding (active)
5. Weekly Reports (active)

Would you like me to activate the Data Sync Pipeline?`,

  externalDocUrl: 'https://docs.n8n.io',

  // ============================================
  // Dashboard
  // ============================================

  quickStartSteps: [
    'Add your n8n instance URL and API key',
    'Copy the generated Service API key',
    'Configure your MCP client (Claude Desktop, Cursor, etc.)',
    'Start automating with AI!',
  ],

  emptyConnectionCTA: 'Add your first n8n connection',

  // ============================================
  // Documentation
  // ============================================

  connectionGuide: (
    <>
      <p className="text-n2f-text-secondary mb-4">
        Go to <strong>Connections</strong> and add your n8n instance:
      </p>
      <ul className="list-disc pl-6 space-y-2 text-n2f-text-secondary mb-4">
        <li>
          <strong className="text-n2f-text">Name:</strong> A friendly name (e.g., "Production
          n8n")
        </li>
        <li>
          <strong className="text-n2f-text">URL:</strong> Your n8n instance URL (e.g.,
          https://n8n.example.com)
        </li>
        <li>
          <strong className="text-n2f-text">API Key:</strong> Generated from n8n Settings → API
        </li>
      </ul>
    </>
  ),

  examplePrompts: [
    'List all my n8n workflows',
    'Show me the last 5 failed executions',
    'Create a new workflow called Test Automation',
  ],

  mcpConfigName: 'n8n',

  configSections: (
    <>
      <section>
        <h2 className="text-xl font-semibold text-n2f-text mb-4">Multiple n8n Instances</h2>
        <p className="text-n2f-text-secondary mb-4">
          If you have multiple n8n connections, the MCP server will use the first one by default. You
          can switch connections using the{' '}
          <code className="bg-n2f-elevated px-1 rounded">switch_connection</code> tool.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-n2f-text mb-4">n8n API Key Permissions</h2>
        <p className="text-n2f-text-secondary mb-4">
          Your n8n API key needs the following permissions for full functionality:
        </p>
        <div className="grid sm:grid-cols-2 gap-3">
          <div className="bg-n2f-card border border-n2f-border rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <Shield className="h-4 w-4 text-green-400" />
              <span className="text-n2f-text font-medium">Required</span>
            </div>
            <ul className="text-sm text-n2f-text-secondary space-y-1">
              <li>workflow:list</li>
              <li>workflow:read</li>
              <li>execution:list</li>
              <li>execution:read</li>
            </ul>
          </div>
          <div className="bg-n2f-card border border-n2f-border rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <Shield className="h-4 w-4 text-yellow-400" />
              <span className="text-n2f-text font-medium">Optional (for write access)</span>
            </div>
            <ul className="text-sm text-n2f-text-secondary space-y-1">
              <li>workflow:create</li>
              <li>workflow:update</li>
              <li>workflow:delete</li>
              <li>credential:*</li>
            </ul>
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
      name: 'n8n Connection',
      icon: <Code className="h-5 w-5" />,
      items: [
        {
          question: 'How do I get my n8n API key?',
          answer: (
            <ol className="list-decimal pl-5 space-y-2">
              <li>Log in to your n8n instance</li>
              <li>
                Go to <strong>Settings → API</strong> (or click your user icon → Settings)
              </li>
              <li>
                Click <strong>"Create API Key"</strong>
              </li>
              <li>Give it a name and copy the generated key</li>
              <li>Paste it when adding a connection in our dashboard</li>
            </ol>
          ),
        },
        {
          question: 'Is my n8n API key secure?',
          answer: (
            <div className="space-y-2">
              <p>Yes, we take security seriously:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>
                  Your n8n API key is <strong>encrypted with AES-256-GCM</strong> before storage
                </li>
                <li>Encryption uses a unique key that is not stored in the database</li>
                <li>We only decrypt the key when proxying requests to your n8n instance</li>
                <li>All communications use HTTPS/TLS encryption</li>
              </ul>
            </div>
          ),
        },
        {
          question: 'Can I connect multiple n8n instances?',
          answer:
            'Yes! You can add multiple n8n connections to your account. Each connection can have its own API keys for different MCP clients or purposes.',
        },
        {
          question: 'What n8n features can I access via MCP?',
          answer: (
            <div className="space-y-2">
              <p>The n8n plugin provides tools covering:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>
                  <strong>Workflows</strong> - List, get, create, update, delete,
                  activate/deactivate
                </li>
                <li>
                  <strong>Executions</strong> - List, get details, delete, retry failed executions
                </li>
                <li>
                  <strong>Credentials</strong> - Create, update, delete credential entries
                </li>
                <li>
                  <strong>Tags</strong> - List, create, update, delete workflow tags
                </li>
                <li>
                  <strong>Users</strong> - List and manage n8n users (admin only)
                </li>
              </ul>
            </div>
          ),
        },
        {
          question: 'Why is my connection showing "error" status?',
          answer: (
            <div className="space-y-2">
              <p>Common reasons for connection errors:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>
                  <strong>Invalid API key</strong> - The n8n API key may have been revoked or expired
                </li>
                <li>
                  <strong>n8n instance unreachable</strong> - Your n8n server may be down or behind a
                  firewall
                </li>
                <li>
                  <strong>Incorrect URL</strong> - Make sure the URL includes the protocol (https://)
                </li>
                <li>
                  <strong>API not enabled</strong> - Ensure the Public API is enabled in n8n settings
                </li>
              </ul>
            </div>
          ),
        },
      ],
    },
  ],
};
