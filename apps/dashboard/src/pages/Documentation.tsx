import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@node2flow/dashboard-core';
import {
  Zap,
  ArrowLeft,
  Book,
  Rocket,
  Code,
  Key,
  AlertCircle,
  ChevronRight,
  Copy,
  Check,
  Workflow,
  Play,
  Tag,
  Variable,
  Users,
  Terminal,
  ExternalLink,
  Loader2,
} from 'lucide-react';
import { plugins } from '../plugins/registry';
import { getPluginTools } from '../lib/gateway-api';

type TabId = 'quickstart' | 'tools' | 'api' | 'config' | 'errors';

interface Tool {
  name: string;
  description: string;
  category: string;
}

const errorCodes = [
  { code: 'UNAUTHORIZED', status: 401, description: 'Invalid or missing API key', solution: 'Check your API key is correct and not revoked' },
  { code: 'FORBIDDEN', status: 403, description: 'Access denied to resource', solution: 'Ensure you have permission to access this resource' },
  { code: 'NOT_FOUND', status: 404, description: 'Resource not found', solution: 'Check the resource ID exists' },
  { code: 'RATE_LIMITED', status: 429, description: 'Too many requests', solution: 'Wait and retry, or upgrade your plan' },
  { code: 'DAILY_LIMIT_EXCEEDED', status: 429, description: 'Daily request limit reached', solution: 'Wait until midnight UTC or upgrade plan' },
  { code: 'CONNECTION_ERROR', status: 502, description: 'Cannot reach n8n instance', solution: 'Check n8n URL and ensure instance is running' },
  { code: 'N8N_API_ERROR', status: 502, description: 'n8n API returned an error', solution: 'Check n8n API key permissions' },
  { code: 'INVALID_REQUEST', status: 400, description: 'Malformed request body', solution: 'Check request parameters match schema' },
  { code: 'INTERNAL_ERROR', status: 500, description: 'Internal server error', solution: 'Contact support if issue persists' },
];

function CodeBlock({ code, language = 'json' }: { code: string; language?: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative group">
      <pre className={`bg-black rounded-lg p-4 text-sm overflow-x-auto language-${language}`}>
        <code className="text-green-400">{code}</code>
      </pre>
      <button
        onClick={handleCopy}
        className="absolute top-2 right-2 p-2 bg-n2f-elevated rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
        title="Copy to clipboard"
      >
        {copied ? (
          <Check className="h-4 w-4 text-green-400" />
        ) : (
          <Copy className="h-4 w-4 text-n2f-text-muted" />
        )}
      </button>
    </div>
  );
}

function TabButton({ id, label, icon, active, onClick }: {
  id: TabId;
  label: string;
  icon: React.ReactNode;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
        active
          ? 'bg-n2f-accent text-gray-900'
          : 'text-n2f-text-secondary hover:bg-n2f-elevated'
      }`}
    >
      {icon}
      <span className="hidden sm:inline">{label}</span>
    </button>
  );
}

export default function Documentation() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<TabId>('quickstart');
  const [toolFilter, setToolFilter] = useState('');
  const [mcpTools, setMcpTools] = useState<Tool[]>([]);
  const [toolsLoading, setToolsLoading] = useState(false);

  const firstPlugin = plugins[0];
  const pc = firstPlugin?.content;
  const mcpConfigName = pc?.mcpConfigName || firstPlugin?.id || 'service';

  // Fetch tools from Gateway API
  useEffect(() => {
    async function fetchTools() {
      setToolsLoading(true);
      try {
        const allTools: Tool[] = [];
        for (const plugin of plugins) {
          const res = await getPluginTools(plugin.id);
          if (res.success && res.data) {
            for (const t of res.data.tools) {
              // Derive category from tool name prefix (e.g., n8n_list_workflows -> Workflows)
              const parts = t.name.replace(`${plugin.id}_`, '').split('_');
              const action = parts.slice(0, -1).join('_'); // e.g., "list"
              const resource = parts[parts.length - 1]; // e.g., "workflows"
              const category = resource.charAt(0).toUpperCase() + resource.slice(1);
              allTools.push({ name: t.name, description: t.description, category });
            }
          }
        }
        if (allTools.length > 0) setMcpTools(allTools);
      } catch {
        // Keep empty tools - will show "no tools" state
      } finally {
        setToolsLoading(false);
      }
    }
    fetchTools();
  }, []);

  const filteredTools = mcpTools.filter(
    (tool) =>
      tool.name.toLowerCase().includes(toolFilter.toLowerCase()) ||
      tool.description.toLowerCase().includes(toolFilter.toLowerCase()) ||
      tool.category.toLowerCase().includes(toolFilter.toLowerCase())
  );

  const toolsByCategory = filteredTools.reduce((acc, tool) => {
    if (!acc[tool.category]) acc[tool.category] = [];
    acc[tool.category].push(tool);
    return acc;
  }, {} as Record<string, Tool[]>);

  const categoryIcons: Record<string, React.ReactNode> = {
    Workflows: <Workflow className="h-4 w-4" />,
    Executions: <Play className="h-4 w-4" />,
    Credentials: <Key className="h-4 w-4" />,
    Tags: <Tag className="h-4 w-4" />,
    Variables: <Variable className="h-4 w-4" />,
    Users: <Users className="h-4 w-4" />,
    Connections: <Zap className="h-4 w-4" />,
    Utility: <Terminal className="h-4 w-4" />,
  };

  const content = (
    <>
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-n2f-accent/10 p-3 rounded-lg">
            <Book className="h-6 w-6 text-n2f-accent" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-n2f-text">Documentation</h1>
            <p className="text-n2f-text-secondary">Learn how to integrate Node2Flow with your AI assistant</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap gap-2 mb-8 pb-4 border-b border-n2f-border">
          <TabButton
            id="quickstart"
            label="Quick Start"
            icon={<Rocket className="h-4 w-4" />}
            active={activeTab === 'quickstart'}
            onClick={() => setActiveTab('quickstart')}
          />
          <TabButton
            id="tools"
            label="MCP Tools"
            icon={<Terminal className="h-4 w-4" />}
            active={activeTab === 'tools'}
            onClick={() => setActiveTab('tools')}
          />
          <TabButton
            id="api"
            label="API Reference"
            icon={<Code className="h-4 w-4" />}
            active={activeTab === 'api'}
            onClick={() => setActiveTab('api')}
          />
          <TabButton
            id="config"
            label="Configuration"
            icon={<Key className="h-4 w-4" />}
            active={activeTab === 'config'}
            onClick={() => setActiveTab('config')}
          />
          <TabButton
            id="errors"
            label="Error Codes"
            icon={<AlertCircle className="h-4 w-4" />}
            active={activeTab === 'errors'}
            onClick={() => setActiveTab('errors')}
          />
        </div>

        {/* Tab Content */}
        <div className="space-y-8">
          {/* Quick Start */}
          {activeTab === 'quickstart' && (
            <div className="space-y-8">
              <section>
                <h2 className="text-xl font-semibold text-n2f-text mb-4 flex items-center gap-2">
                  <span className="bg-n2f-accent text-gray-900 w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold">1</span>
                  Create an Account
                </h2>
                <p className="text-n2f-text-secondary mb-4">
                  Sign up at{' '}
                  <Link to="/register" className="text-n2f-accent hover:underline">
                    app.node2flow.net/register
                  </Link>{' '}
                  using email or OAuth (GitHub/Google).
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-n2f-text mb-4 flex items-center gap-2">
                  <span className="bg-n2f-accent text-gray-900 w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold">2</span>
                  Add Your Connection
                </h2>
                {pc?.connectionGuide || (
                  <p className="text-n2f-text-secondary mb-4">
                    Go to <strong>Connections</strong> and add your service instance.
                  </p>
                )}
              </section>

              <section>
                <h2 className="text-xl font-semibold text-n2f-text mb-4 flex items-center gap-2">
                  <span className="bg-n2f-accent text-gray-900 w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold">3</span>
                  Generate a Service API Key
                </h2>
                <p className="text-n2f-text-secondary mb-4">
                  On the Connections page, click <strong>"Generate API Key"</strong> for your connection.
                  Copy and save the key securely - it won't be shown again.
                </p>
                <div className="bg-yellow-900/20 border border-yellow-700 rounded-lg p-4">
                  <p className="text-yellow-200 text-sm">
                    <strong className="text-yellow-400">Important:</strong> Your API key starts with{' '}
                    <code className="bg-black/30 px-1 rounded">n2f_</code>. Keep it secret like a password.
                  </p>
                </div>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-n2f-text mb-4 flex items-center gap-2">
                  <span className="bg-n2f-accent text-gray-900 w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold">4</span>
                  Configure Your MCP Client
                </h2>
                <p className="text-n2f-text-secondary mb-4">
                  Add the MCP server to your client's configuration:
                </p>

                <div className="space-y-4">
                  <div>
                    <h3 className="font-medium text-n2f-text mb-2">Claude Desktop</h3>
                    <p className="text-sm text-n2f-text-muted mb-2">
                      Edit <code className="bg-n2f-elevated px-1 rounded">~/Library/Application Support/Claude/claude_desktop_config.json</code> (macOS)
                      or <code className="bg-n2f-elevated px-1 rounded">%APPDATA%\Claude\claude_desktop_config.json</code> (Windows)
                    </p>
                    <CodeBlock
                      code={`{
  "mcpServers": {
    "${mcpConfigName}": {
      "url": "https://mcp.node2flow.net/mcp",
      "headers": {
        "Authorization": "Bearer n2f_your_api_key_here"
      }
    }
  }
}`}
                    />
                  </div>

                  <div>
                    <h3 className="font-medium text-n2f-text mb-2">Cursor</h3>
                    <p className="text-sm text-n2f-text-muted mb-2">
                      Add to your Cursor MCP settings
                    </p>
                    <CodeBlock
                      code={`{
  "${mcpConfigName}": {
    "url": "https://mcp.node2flow.net/mcp",
    "headers": {
      "Authorization": "Bearer n2f_your_api_key_here"
    }
  }
}`}
                    />
                  </div>
                </div>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-n2f-text mb-4 flex items-center gap-2">
                  <span className="bg-n2f-accent text-gray-900 w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold">5</span>
                  Start Using
                </h2>
                <p className="text-n2f-text-secondary mb-4">
                  Restart your MCP client and try asking:
                </p>
                <div className="bg-n2f-card border border-n2f-border rounded-lg p-4">
                  {(pc?.examplePrompts || ['List all my workflows', 'Show me recent executions', 'Create a new workflow']).map((prompt, i) => (
                    <p key={i} className={`text-n2f-text italic${i > 0 ? ' mt-2' : ''}`}>"{prompt}"</p>
                  ))}
                </div>
              </section>
            </div>
          )}

          {/* MCP Tools */}
          {activeTab === 'tools' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <p className="text-n2f-text-secondary">
                  {mcpTools.length} tools available across {Object.keys(toolsByCategory).length} categories
                </p>
                <input
                  type="text"
                  placeholder="Search tools..."
                  value={toolFilter}
                  onChange={(e) => setToolFilter(e.target.value)}
                  className="px-3 py-2 bg-n2f-card border border-n2f-border rounded-lg text-n2f-text placeholder-n2f-text-muted text-sm focus:outline-none focus:ring-2 focus:ring-n2f-accent"
                />
              </div>

              {Object.entries(toolsByCategory).map(([category, tools]) => (
                <section key={category}>
                  <h3 className="text-lg font-semibold text-n2f-text mb-3 flex items-center gap-2">
                    <span className="text-n2f-accent">{categoryIcons[category]}</span>
                    {category}
                    <span className="text-sm font-normal text-n2f-text-muted">({tools.length})</span>
                  </h3>
                  <div className="grid gap-2">
                    {tools.map((tool) => (
                      <div
                        key={tool.name}
                        className="bg-n2f-card border border-n2f-border rounded-lg p-3 flex items-center justify-between hover:border-n2f-accent/30 transition-colors"
                      >
                        <div>
                          <code className="text-n2f-accent font-mono text-sm">{tool.name}</code>
                          <p className="text-n2f-text-secondary text-sm mt-1">{tool.description}</p>
                        </div>
                        <ChevronRight className="h-4 w-4 text-n2f-text-muted" />
                      </div>
                    ))}
                  </div>
                </section>
              ))}

              {filteredTools.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-n2f-text-secondary">No tools match "{toolFilter}"</p>
                  <button
                    onClick={() => setToolFilter('')}
                    className="text-n2f-accent hover:underline mt-2"
                  >
                    Clear search
                  </button>
                </div>
              )}
            </div>
          )}

          {/* API Reference */}
          {activeTab === 'api' && (
            <div className="space-y-8">
              <section>
                <h2 className="text-xl font-semibold text-n2f-text mb-4">Base URL</h2>
                <CodeBlock code="https://mcp.node2flow.net" />
              </section>

              <section>
                <h2 className="text-xl font-semibold text-n2f-text mb-4">Authentication</h2>
                <p className="text-n2f-text-secondary mb-4">
                  All API requests require authentication via Bearer token:
                </p>
                <CodeBlock
                  code={`Authorization: Bearer n2f_your_api_key`}
                />
              </section>

              <section>
                <h2 className="text-xl font-semibold text-n2f-text mb-4">MCP Endpoint</h2>
                <div className="bg-n2f-card border border-n2f-border rounded-lg p-4 mb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="bg-blue-600 text-white text-xs font-bold px-2 py-1 rounded">POST</span>
                    <code className="text-n2f-text">/mcp</code>
                  </div>
                  <p className="text-n2f-text-secondary text-sm">
                    JSON-RPC 2.0 endpoint for MCP tool calls
                  </p>
                </div>
                <h3 className="font-medium text-n2f-text mb-2">Request Example</h3>
                <CodeBlock
                  code={`{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "tools/call",
  "params": {
    "name": "list_workflows",
    "arguments": {
      "limit": 10,
      "active": true
    }
  }
}`}
                />
                <h3 className="font-medium text-n2f-text mb-2 mt-4">Response Example</h3>
                <CodeBlock
                  code={`{
  "jsonrpc": "2.0",
  "id": 1,
  "result": {
    "content": [
      {
        "type": "text",
        "text": "Found 3 active workflows:\\n1. Email Newsletter (ID: abc123)\\n2. Slack Notifications (ID: def456)\\n3. Data Sync (ID: ghi789)"
      }
    ]
  }
}`}
                />
              </section>

              <section>
                <h2 className="text-xl font-semibold text-n2f-text mb-4">REST API Endpoints</h2>
                <div className="space-y-3">
                  <div className="bg-n2f-card border border-n2f-border rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="bg-green-600 text-white text-xs font-bold px-2 py-1 rounded">GET</span>
                      <code className="text-n2f-text">/api/connections</code>
                    </div>
                    <p className="text-n2f-text-secondary text-sm">List your n8n connections</p>
                  </div>
                  <div className="bg-n2f-card border border-n2f-border rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="bg-green-600 text-white text-xs font-bold px-2 py-1 rounded">GET</span>
                      <code className="text-n2f-text">/api/usage</code>
                    </div>
                    <p className="text-n2f-text-secondary text-sm">Get usage statistics</p>
                  </div>
                  <div className="bg-n2f-card border border-n2f-border rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="bg-green-600 text-white text-xs font-bold px-2 py-1 rounded">GET</span>
                      <code className="text-n2f-text">/api/plans</code>
                    </div>
                    <p className="text-n2f-text-secondary text-sm">Get available plans (public)</p>
                  </div>
                </div>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-n2f-text mb-4">Rate Limits</h2>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-n2f-border">
                        <th className="text-left py-2 text-n2f-text">Plan</th>
                        <th className="text-left py-2 text-n2f-text">Requests/Minute</th>
                        <th className="text-left py-2 text-n2f-text">Requests/Day</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-n2f-border text-n2f-text-secondary">
                      <tr>
                        <td className="py-2">Free</td>
                        <td className="py-2">50</td>
                        <td className="py-2">100</td>
                      </tr>
                      <tr>
                        <td className="py-2">Pro</td>
                        <td className="py-2">100</td>
                        <td className="py-2">5,000</td>
                      </tr>
                      <tr>
                        <td className="py-2">Enterprise</td>
                        <td className="py-2">Custom</td>
                        <td className="py-2">Unlimited</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </section>
            </div>
          )}

          {/* Configuration */}
          {activeTab === 'config' && (
            <div className="space-y-8">
              <section>
                <h2 className="text-xl font-semibold text-n2f-text mb-4">Claude Desktop Configuration</h2>
                <p className="text-n2f-text-secondary mb-4">
                  Full configuration file location:
                </p>
                <ul className="list-disc pl-6 space-y-1 text-n2f-text-secondary mb-4">
                  <li><strong className="text-n2f-text">macOS:</strong> <code className="bg-n2f-elevated px-1 rounded">~/Library/Application Support/Claude/claude_desktop_config.json</code></li>
                  <li><strong className="text-n2f-text">Windows:</strong> <code className="bg-n2f-elevated px-1 rounded">%APPDATA%\Claude\claude_desktop_config.json</code></li>
                  <li><strong className="text-n2f-text">Linux:</strong> <code className="bg-n2f-elevated px-1 rounded">~/.config/Claude/claude_desktop_config.json</code></li>
                </ul>
                <CodeBlock
                  code={`{
  "mcpServers": {
    "${mcpConfigName}": {
      "url": "https://mcp.node2flow.net/mcp",
      "headers": {
        "Authorization": "Bearer n2f_your_api_key_here"
      }
    }
  }
}`}
                />
              </section>

              {pc?.configSections}

              <section>
                <h2 className="text-xl font-semibold text-n2f-text mb-4">Environment Variables</h2>
                <p className="text-n2f-text-secondary mb-4">
                  If you're self-hosting or contributing to the project:
                </p>
                <CodeBlock
                  code={`# Required
JWT_SECRET=your-secret-key-min-32-chars
ENCRYPTION_KEY=your-32-char-encryption-key

# OAuth (optional)
GITHUB_CLIENT_ID=xxx
GITHUB_CLIENT_SECRET=xxx
GOOGLE_CLIENT_ID=xxx
GOOGLE_CLIENT_SECRET=xxx

# Stripe (optional)
STRIPE_SECRET_KEY=sk_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx`}
                />
              </section>
            </div>
          )}

          {/* Error Codes */}
          {activeTab === 'errors' && (
            <div className="space-y-6">
              <p className="text-n2f-text-secondary">
                Common error codes and how to resolve them:
              </p>

              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-n2f-border">
                      <th className="text-left py-3 text-n2f-text">Code</th>
                      <th className="text-left py-3 text-n2f-text">Status</th>
                      <th className="text-left py-3 text-n2f-text">Description</th>
                      <th className="text-left py-3 text-n2f-text">Solution</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-n2f-border">
                    {errorCodes.map((error) => (
                      <tr key={error.code} className="text-n2f-text-secondary">
                        <td className="py-3">
                          <code className="bg-red-900/30 text-red-400 px-2 py-1 rounded text-xs">
                            {error.code}
                          </code>
                        </td>
                        <td className="py-3">{error.status}</td>
                        <td className="py-3">{error.description}</td>
                        <td className="py-3">{error.solution}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <section className="mt-8">
                <h2 className="text-xl font-semibold text-n2f-text mb-4">Error Response Format</h2>
                <CodeBlock
                  code={`{
  "jsonrpc": "2.0",
  "id": 1,
  "error": {
    "code": -32000,
    "message": "RATE_LIMITED",
    "data": {
      "detail": "Rate limit exceeded. 50 requests per minute allowed.",
      "retry_after": 60
    }
  }
}`}
                />
              </section>

              <section className="bg-n2f-card border border-n2f-border rounded-lg p-6">
                <h3 className="text-lg font-semibold text-n2f-text mb-2">Need Help?</h3>
                <p className="text-n2f-text-secondary mb-4">
                  If you're experiencing persistent errors:
                </p>
                <div className="flex flex-wrap gap-3">
                  <Link
                    to="/faq"
                    className="inline-flex items-center gap-2 text-n2f-accent hover:underline"
                  >
                    Check the FAQ <ExternalLink className="h-4 w-4" />
                  </Link>
                  <a
                    href="mailto:support@node2flow.net"
                    className="inline-flex items-center gap-2 text-n2f-accent hover:underline"
                  >
                    Contact Support <ExternalLink className="h-4 w-4" />
                  </a>
                </div>
              </section>
            </div>
          )}
        </div>

        {/* Footer navigation */}
        {!user && (
          <div className="mt-12 pt-8 border-t border-n2f-border flex flex-wrap justify-between gap-4 text-sm">
            <div className="flex gap-4">
              <Link to="/faq" className="text-n2f-accent hover:underline">FAQ</Link>
              <Link to="/terms" className="text-n2f-accent hover:underline">Terms</Link>
              <Link to="/privacy" className="text-n2f-accent hover:underline">Privacy</Link>
            </div>
            <Link to="/" className="text-n2f-accent hover:underline">
              Back to Home →
            </Link>
          </div>
        )}
    </>
  );

  if (user) {
    return <div className="space-y-6">{content}</div>;
  }

  return (
    <div className="min-h-screen bg-n2f-bg">
      <header className="border-b border-n2f-border sticky top-0 bg-n2f-bg/95 backdrop-blur z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center gap-2">
              <div className="bg-n2f-accent p-2 rounded-lg">
                <Zap className="h-5 w-5 text-gray-900" />
              </div>
              <span className="text-xl font-bold text-n2f-text">Node2Flow</span>
            </Link>
            <Link to="/" className="text-n2f-text-secondary hover:text-n2f-text flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Home
            </Link>
          </div>
        </div>
      </header>
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {content}
      </main>
    </div>
  );
}
