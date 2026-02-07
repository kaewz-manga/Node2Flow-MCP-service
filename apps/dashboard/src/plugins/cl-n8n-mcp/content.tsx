/**
 * cl-n8n-mcp Plugin Content
 * All cl-n8n-mcp-specific content used by global pages (Landing, Dashboard, Documentation, FAQ).
 */

import { Cpu, Search, FileCode, Shield } from 'lucide-react';
import type { PluginContent } from '../registry';

export const clN8nMcpContent: PluginContent = {
  // ============================================
  // Landing Page
  // ============================================

  tagline: 'Build n8n Workflows with AI',
  description:
    'Search 500+ n8n nodes, validate configurations, browse templates, and build workflows — all through your AI assistant.',

  features: [
    {
      icon: <Search className="h-6 w-6" />,
      title: 'Node Documentation',
      description:
        'Search and explore 500+ n8n nodes with detailed property info, version history, and real-world examples.',
    },
    {
      icon: <FileCode className="h-6 w-6" />,
      title: 'Template Library',
      description:
        'Browse and deploy workflow templates from n8n.io. Search by keyword, node type, or task category.',
    },
    {
      icon: <Shield className="h-6 w-6" />,
      title: 'Validation & Autofix',
      description:
        'Validate node configs and complete workflows. Auto-fix common issues like expression format and typeVersions.',
    },
  ],

  setupSteps: [
    {
      title: 'Connect cl-n8n-mcp',
      description:
        'Add your cl-n8n-mcp server URL and authentication token. Optionally link an n8n instance for workflow management.',
    },
  ],

  demoCode: `> Search for HTTP request nodes in n8n

Found 3 matching nodes:

1. **HTTP Request** (nodes-base.httpRequest)
   Make HTTP requests to any API endpoint
   Latest version: 4.2

2. **HTTP Request Tool** (nodes-langchain.httpRequestTool)
   HTTP request as AI agent tool

3. **Webhook** (nodes-base.webhook)
   Receive HTTP requests as triggers

> Validate my Slack node config

✅ Valid configuration
- Resource: message ✓
- Operation: post ✓
- Channel: #general ✓
1 suggestion: Consider adding "Text" parameter`,

  externalDocUrl: 'https://github.com/kaewz-manga/cl-n8n-mcp',

  // ============================================
  // Dashboard
  // ============================================

  quickStartSteps: [
    'Add your cl-n8n-mcp server URL and auth token',
    'Optionally link an n8n instance URL and API key for management tools',
    'Copy the generated Service API key',
    'Start building workflows with AI!',
  ],

  emptyConnectionCTA: 'Add your first cl-n8n-mcp connection',

  // ============================================
  // Documentation
  // ============================================

  connectionGuide: (
    <>
      <p className="text-n2f-text-secondary mb-4">
        Go to <strong>Connections</strong> and add your cl-n8n-mcp server:
      </p>
      <ul className="list-disc pl-6 space-y-2 text-n2f-text-secondary mb-4">
        <li>
          <strong className="text-n2f-text">Name:</strong> A friendly name (e.g., "My Workflow Builder")
        </li>
        <li>
          <strong className="text-n2f-text">MCP URL:</strong> Your cl-n8n-mcp server URL (e.g.,
          https://cl-n8n-mcp.node2flow.net)
        </li>
        <li>
          <strong className="text-n2f-text">Auth Token:</strong> Your cl-n8n-mcp authentication token or n2f_ API key
        </li>
        <li>
          <strong className="text-n2f-text">n8n URL (optional):</strong> Your n8n instance URL for workflow management tools
        </li>
        <li>
          <strong className="text-n2f-text">n8n API Key (optional):</strong> Your n8n API key for workflow management tools
        </li>
      </ul>
    </>
  ),

  examplePrompts: [
    'Search for webhook nodes in n8n',
    'Show me the Slack node configuration',
    'Validate my workflow for errors',
    'Deploy template #1234 to my n8n instance',
  ],

  mcpConfigName: 'cl-n8n-mcp',

  configSections: (
    <>
      <section>
        <h2 className="text-xl font-semibold text-n2f-text mb-4">Documentation vs Management Tools</h2>
        <p className="text-n2f-text-secondary mb-4">
          cl-n8n-mcp provides two types of tools:
        </p>
        <div className="grid sm:grid-cols-2 gap-3">
          <div className="bg-n2f-card border border-n2f-border rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <Search className="h-4 w-4 text-blue-400" />
              <span className="text-n2f-text font-medium">Documentation (7 tools)</span>
            </div>
            <ul className="text-sm text-n2f-text-secondary space-y-1">
              <li>Search 500+ n8n nodes</li>
              <li>Get node documentation</li>
              <li>Validate configurations</li>
              <li>Browse templates</li>
            </ul>
            <p className="text-xs text-n2f-text-muted mt-2">No n8n instance required</p>
          </div>
          <div className="bg-n2f-card border border-n2f-border rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <Cpu className="h-4 w-4 text-purple-400" />
              <span className="text-n2f-text font-medium">Management (13 tools)</span>
            </div>
            <ul className="text-sm text-n2f-text-secondary space-y-1">
              <li>Create/update workflows</li>
              <li>Test and execute workflows</li>
              <li>Auto-fix validation errors</li>
              <li>Deploy templates</li>
            </ul>
            <p className="text-xs text-n2f-text-muted mt-2">Requires n8n URL + API key</p>
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
      name: 'n8n Workflow Builder',
      icon: <Cpu className="h-5 w-5" />,
      items: [
        {
          question: 'What is cl-n8n-mcp?',
          answer: (
            <div className="space-y-2">
              <p>
                cl-n8n-mcp is a Multi-tenant MCP server for n8n workflow building. It provides 20 tools:
              </p>
              <ul className="list-disc pl-5 space-y-1">
                <li><strong>7 documentation tools</strong> — Search nodes, get node info, validate configs, browse templates</li>
                <li><strong>13 management tools</strong> — Create/update workflows, test execution, auto-fix errors, deploy templates</li>
              </ul>
            </div>
          ),
        },
        {
          question: 'Do I need an n8n instance?',
          answer: (
            <div className="space-y-2">
              <p>Not for documentation tools. You can search nodes, browse templates, and validate configurations without connecting an n8n instance.</p>
              <p>For management tools (creating workflows, testing, deploying templates), you need to provide your n8n instance URL and API key.</p>
            </div>
          ),
        },
        {
          question: 'How do I get an n8n API key?',
          answer: (
            <ol className="list-decimal pl-5 space-y-2">
              <li>Log in to your n8n instance</li>
              <li>Go to <strong>Settings → API</strong></li>
              <li>Click <strong>Create an API key</strong></li>
              <li>Copy the generated key</li>
            </ol>
          ),
        },
        {
          question: 'What tools are available?',
          answer: (
            <div className="space-y-2">
              <p>20 tools across documentation and management:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li><strong>search_nodes</strong> — Find n8n nodes by keyword</li>
                <li><strong>get_node</strong> — Get detailed node documentation</li>
                <li><strong>validate_node</strong> — Validate node configuration</li>
                <li><strong>search_templates</strong> — Browse workflow templates</li>
                <li><strong>validate_workflow</strong> — Check workflow for errors</li>
                <li><strong>n8n_create_workflow</strong> — Build new workflows</li>
                <li><strong>n8n_autofix_workflow</strong> — Auto-fix common issues</li>
                <li><strong>n8n_deploy_template</strong> — Deploy templates to n8n</li>
                <li>...and 12 more</li>
              </ul>
            </div>
          ),
        },
      ],
    },
  ],
};
