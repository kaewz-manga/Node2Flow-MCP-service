import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth, Card, CardContent, CardHeader, CardTitle, Button, Input, Separator, Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@node2flow/dashboard-core';

import {
  Zap,
  ArrowLeft,
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
      <Button
        variant="ghost"
        size="icon"
        onClick={handleCopy}
        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
      >
        {copied ? (
          <Check className="h-4 w-4 text-green-400" />
        ) : (
          <Copy className="h-4 w-4 text-muted-foreground" />
        )}
      </Button>
    </div>
  );
}

function TabButton({ label, icon, active, onClick }: {
  id: TabId;
  label: string;
  icon: React.ReactNode;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <Button
      variant={active ? 'default' : 'ghost'}
      onClick={onClick}
      className="gap-2"
    >
      {icon}
      <span className="hidden sm:inline">{label}</span>
    </Button>
  );
}

export default function Documentation() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<TabId>('quickstart');
  const [toolFilter, setToolFilter] = useState('');
  const [mcpTools, setMcpTools] = useState<Tool[]>([]);
  const [, setToolsLoading] = useState(false);
  const [selectedPluginIdx, setSelectedPluginIdx] = useState(0);

  const selectedPlugin = plugins[selectedPluginIdx];
  const pc = selectedPlugin?.content;
  const mcpConfigName = pc?.mcpConfigName || selectedPlugin?.id || 'service';

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
        <div>
          <h1 className="text-2xl font-bold text-foreground">Documentation</h1>
          <p className="text-muted-foreground mt-1">Learn how to integrate Node2Flow with your AI assistant</p>
        </div>

        <Separator />

        {/* Product Selector */}
        {plugins.length > 1 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {plugins.map((plugin, idx) => (
              <Button
                key={plugin.id}
                variant={idx === selectedPluginIdx ? 'default' : 'secondary'}
                size="sm"
                onClick={() => setSelectedPluginIdx(idx)}
              >
                {plugin.name}
              </Button>
            ))}
          </div>
        )}

        {/* Tabs */}
        <div className="flex flex-wrap gap-2 mb-8 pb-4 border-b border-border">
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
                <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
                  <span className="bg-primary text-primary-foreground w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold">1</span>
                  Create an Account
                </h2>
                <p className="text-muted-foreground mb-4">
                  Sign up at{' '}
                  <Link to="/register" className="text-primary hover:underline">
                    app.node2flow.net/register
                  </Link>{' '}
                  using email or OAuth (GitHub/Google).
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
                  <span className="bg-primary text-primary-foreground w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold">2</span>
                  Add Your Connection
                </h2>
                {pc?.connectionGuide || (
                  <p className="text-muted-foreground mb-4">
                    Go to <strong>Connections</strong> and add your service instance.
                  </p>
                )}
              </section>

              <section>
                <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
                  <span className="bg-primary text-primary-foreground w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold">3</span>
                  Generate a Service API Key
                </h2>
                <p className="text-muted-foreground mb-4">
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
                <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
                  <span className="bg-primary text-primary-foreground w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold">4</span>
                  Configure Your MCP Client
                </h2>
                <p className="text-muted-foreground mb-4">
                  Add the MCP server to your client's configuration:
                </p>

                <div className="space-y-4">
                  <div>
                    <h3 className="font-medium text-foreground mb-2">Claude Desktop (stdio proxy)</h3>
                    <p className="text-sm text-muted-foreground mb-2">
                      First, install the stdio server:
                    </p>
                    <CodeBlock
                      code={`git clone https://github.com/kaewz-manga/n8n-management-mcp.git
cd n8n-management-mcp && npm install`}
                      language="bash"
                    />
                    <p className="text-sm text-muted-foreground mt-3 mb-2">
                      Then edit <code className="bg-muted px-1 rounded">%APPDATA%\Claude\claude_desktop_config.json</code> (Windows)
                      or <code className="bg-muted px-1 rounded">~/Library/Application Support/Claude/claude_desktop_config.json</code> (macOS):
                    </p>
                    <CodeBlock
                      code={`{
  "mcpServers": {
    "${mcpConfigName}": {
      "command": "node",
      "args": [
        "/path/to/n8n-management-mcp/stdio-server.js",
        "n2f_your_api_key_here"
      ]
    }
  }
}`}
                    />
                  </div>

                  <div>
                    <h3 className="font-medium text-foreground mb-2">Cursor / Claude Code / Windsurf</h3>
                    <p className="text-sm text-muted-foreground mb-2">
                      Clients that support HTTP transport can connect directly:
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
                <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
                  <span className="bg-primary text-primary-foreground w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold">5</span>
                  Start Using
                </h2>
                <p className="text-muted-foreground mb-4">
                  Restart your MCP client and try asking:
                </p>
                <Card className="bg-gradient-to-t from-primary/5 to-card shadow-sm">
                  <CardContent className="p-4">
                    {(pc?.examplePrompts || ['List all my workflows', 'Show me recent executions', 'Create a new workflow']).map((prompt, i) => (
                      <p key={i} className={`text-foreground italic${i > 0 ? ' mt-2' : ''}`}>"{prompt}"</p>
                    ))}
                  </CardContent>
                </Card>
              </section>
            </div>
          )}

          {/* MCP Tools */}
          {activeTab === 'tools' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <p className="text-muted-foreground">
                  {mcpTools.length} tools available across {Object.keys(toolsByCategory).length} categories
                </p>
                <Input
                  type="text"
                  placeholder="Search tools..."
                  value={toolFilter}
                  onChange={(e) => setToolFilter(e.target.value)}
                  className="w-auto max-w-xs"
                />
              </div>

              {Object.entries(toolsByCategory).map(([category, tools]) => (
                <section key={category}>
                  <h3 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
                    <span className="text-primary">{categoryIcons[category]}</span>
                    {category}
                    <span className="text-sm font-normal text-muted-foreground">({tools.length})</span>
                  </h3>
                  <div className="grid gap-2">
                    {tools.map((tool) => (
                      <Card
                        key={tool.name}
                        className="hover:border-primary/30 hover:shadow-md transition-all"
                      >
                        <CardContent className="p-3 flex items-center justify-between">
                          <div>
                            <code className="text-primary font-mono text-sm">{tool.name}</code>
                            <p className="text-muted-foreground text-sm mt-1">{tool.description}</p>
                          </div>
                          <ChevronRight className="h-4 w-4 text-muted-foreground" />
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </section>
              ))}

              {filteredTools.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No tools match "{toolFilter}"</p>
                  <Button variant="link" onClick={() => setToolFilter('')} className="mt-2">
                    Clear search
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* API Reference */}
          {activeTab === 'api' && (
            <div className="space-y-8">
              <section>
                <h2 className="text-xl font-semibold text-foreground mb-4">Base URL</h2>
                <CodeBlock code="https://mcp.node2flow.net" />
              </section>

              <section>
                <h2 className="text-xl font-semibold text-foreground mb-4">Authentication</h2>
                <p className="text-muted-foreground mb-4">
                  All API requests require authentication via Bearer token:
                </p>
                <CodeBlock
                  code={`Authorization: Bearer n2f_your_api_key`}
                />
              </section>

              <section>
                <h2 className="text-xl font-semibold text-foreground mb-4">MCP Endpoint</h2>
                <Card className="mb-4 hover:shadow-md transition-all">
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-2">
                      <span className="bg-blue-600 text-white text-xs font-bold px-2 py-1 rounded">POST</span>
                      <CardTitle className="text-base"><code>/mcp</code></CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <p className="text-muted-foreground text-sm">
                      JSON-RPC 2.0 endpoint for MCP tool calls
                    </p>
                  </CardContent>
                </Card>
                <h3 className="font-medium text-foreground mb-2">Request Example</h3>
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
                <h3 className="font-medium text-foreground mb-2 mt-4">Response Example</h3>
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
                <h2 className="text-xl font-semibold text-foreground mb-4">REST API Endpoints</h2>
                <div className="space-y-3">
                  <Card className="hover:shadow-md transition-all">
                    <CardHeader className="pb-3">
                      <div className="flex items-center gap-2">
                        <span className="bg-green-600 text-white text-xs font-bold px-2 py-1 rounded">GET</span>
                        <CardTitle className="text-base"><code>/api/connections</code></CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <p className="text-muted-foreground text-sm">List your n8n connections</p>
                    </CardContent>
                  </Card>
                  <Card className="hover:shadow-md transition-all">
                    <CardHeader className="pb-3">
                      <div className="flex items-center gap-2">
                        <span className="bg-green-600 text-white text-xs font-bold px-2 py-1 rounded">GET</span>
                        <CardTitle className="text-base"><code>/api/usage</code></CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <p className="text-muted-foreground text-sm">Get usage statistics</p>
                    </CardContent>
                  </Card>
                  <Card className="hover:shadow-md transition-all">
                    <CardHeader className="pb-3">
                      <div className="flex items-center gap-2">
                        <span className="bg-green-600 text-white text-xs font-bold px-2 py-1 rounded">GET</span>
                        <CardTitle className="text-base"><code>/api/plans</code></CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <p className="text-muted-foreground text-sm">Get available plans (public)</p>
                    </CardContent>
                  </Card>
                </div>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-foreground mb-4">Rate Limits</h2>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Plan</TableHead>
                        <TableHead>Requests/Minute</TableHead>
                        <TableHead>Requests/Day</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow>
                        <TableCell>Free</TableCell>
                        <TableCell>50</TableCell>
                        <TableCell>100</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Pro</TableCell>
                        <TableCell>100</TableCell>
                        <TableCell>5,000</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Enterprise</TableCell>
                        <TableCell>Custom</TableCell>
                        <TableCell>Unlimited</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
              </section>
            </div>
          )}

          {/* Configuration */}
          {activeTab === 'config' && (
            <div className="space-y-8">
              <section>
                <h2 className="text-xl font-semibold text-foreground mb-4">Claude Desktop Configuration</h2>
                <p className="text-muted-foreground mb-4">
                  Config file location:
                </p>
                <ul className="list-disc pl-6 space-y-1 text-muted-foreground mb-4">
                  <li><strong className="text-foreground">Windows:</strong> <code className="bg-muted px-1 rounded">%APPDATA%\Claude\claude_desktop_config.json</code></li>
                  <li><strong className="text-foreground">macOS:</strong> <code className="bg-muted px-1 rounded">~/Library/Application Support/Claude/claude_desktop_config.json</code></li>
                  <li><strong className="text-foreground">Linux:</strong> <code className="bg-muted px-1 rounded">~/.config/Claude/claude_desktop_config.json</code></li>
                </ul>
                <h3 className="font-medium text-foreground mb-2">stdio proxy (recommended)</h3>
                <p className="text-sm text-muted-foreground mb-2">
                  Install first: <code className="bg-muted px-1 rounded">git clone https://github.com/kaewz-manga/n8n-management-mcp.git && cd n8n-management-mcp && npm install</code>
                </p>
                <CodeBlock
                  code={`{
  "mcpServers": {
    "${mcpConfigName}": {
      "command": "node",
      "args": [
        "/path/to/n8n-management-mcp/stdio-server.js",
        "n2f_your_api_key_here"
      ]
    }
  }
}`}
                />
                <h3 className="font-medium text-foreground mt-4 mb-2">HTTP transport (Cursor / Claude Code / Windsurf)</h3>
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
              </section>

              {pc?.configSections}

              <section>
                <h2 className="text-xl font-semibold text-foreground mb-4">Environment Variables</h2>
                <p className="text-muted-foreground mb-4">
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
              <p className="text-muted-foreground">
                Common error codes and how to resolve them:
              </p>

              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Code</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Solution</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {errorCodes.map((error) => (
                      <TableRow key={error.code}>
                        <TableCell>
                          <code className="bg-red-900/30 text-red-400 px-2 py-1 rounded text-xs">
                            {error.code}
                          </code>
                        </TableCell>
                        <TableCell>{error.status}</TableCell>
                        <TableCell>{error.description}</TableCell>
                        <TableCell>{error.solution}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              <section className="mt-8">
                <h2 className="text-xl font-semibold text-foreground mb-4">Error Response Format</h2>
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

              <Card className="hover:shadow-md transition-all">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Need Help?</CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-muted-foreground mb-3">
                    If you're experiencing persistent errors:
                  </p>
                  <div className="flex flex-wrap gap-3">
                    <Link
                      to="/faq"
                      className="inline-flex items-center gap-2 text-primary hover:underline"
                    >
                      Check the FAQ <ExternalLink className="h-4 w-4" />
                    </Link>
                    <a
                      href="mailto:support@node2flow.net"
                      className="inline-flex items-center gap-2 text-primary hover:underline"
                    >
                      Contact Support <ExternalLink className="h-4 w-4" />
                    </a>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>

        {/* Footer navigation */}
        {!user && (
          <>
            <Separator className="mt-12" />
            <div className="mt-8 flex flex-wrap justify-between gap-4 text-sm">
              <div className="flex gap-4">
                <Link to="/faq" className="text-primary hover:underline">FAQ</Link>
                <Link to="/terms" className="text-primary hover:underline">Terms</Link>
                <Link to="/privacy" className="text-primary hover:underline">Privacy</Link>
              </div>
              <Link to="/" className="text-primary hover:underline">
                Back to Home →
              </Link>
            </div>
          </>
        )}
    </>
  );

  if (user) {
    return <div className="space-y-6">{content}</div>;
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border sticky top-0 bg-background/95 backdrop-blur z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center gap-2">
              <div className="bg-primary p-2 rounded-lg">
                <Zap className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold text-foreground">Node2Flow</span>
            </Link>
            <Link to="/" className="text-muted-foreground hover:text-foreground flex items-center gap-2">
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
