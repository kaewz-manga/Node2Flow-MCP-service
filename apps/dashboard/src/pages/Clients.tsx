import { useState, useEffect, useMemo } from 'react';
import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  type SortingState,
  useReactTable,
} from '@tanstack/react-table';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
  Button, Input, Badge,
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from '@node2flow/dashboard-core';
import { ArrowUpDown, ChevronLeft, ChevronRight, Loader2, Copy, Check, Search, BookOpen, MessageSquarePlus, Plus, Info, AlertTriangle } from 'lucide-react';
import { getClientUsage, type ClientUsageStats } from '@/lib/platform-api';

// ============================================
// MCP Client Card Grid
// ============================================

const MCP_URL = 'https://mcp.node2flow.net';

interface GuideStep {
  title: string;
  content: string;
  copyItems?: { label: string; value: string }[];
  note?: { type: 'info' | 'warning'; title: string; content: string };
}

interface McpClient {
  id: string;
  name: string;
  auth: 'OAuth' | 'API Key' | '';
  recommended?: boolean;
  description: string;
  copyLabel: string;
  copyValue: string;
  guide?: GuideStep[];
  color: string;
  icon?: string;
  linkUrl?: string;
}

const mcpClients: McpClient[] = [
  {
    id: 'n8n',
    name: 'n8n AI Agent',
    auth: 'API Key',
    description: 'Use MCP Client tool in n8n workflows to automate your n8n instance.',
    copyLabel: 'Copy Endpoint',
    copyValue: `${MCP_URL}/mcp`,
    color: '#ea4b71',
    icon: '/logos/n8n.svg',
    guide: [
      { title: 'Open n8n Workflow', content: 'Open your n8n workflow editor and add an **AI Agent** node' },
      { title: 'Add MCP Client Tool', content: 'Add a **MCP Client** tool to your AI Agent node', copyItems: [{ label: 'Endpoint', value: `${MCP_URL}/mcp` }] },
      { title: 'Configure Authentication', content: 'Set the authentication header', copyItems: [{ label: 'Header Name', value: 'Authorization' }, { label: 'Header Value', value: 'Bearer YOUR_API_KEY' }], note: { type: 'info', title: 'API Key', content: 'Get your API key from Settings \u2192 API Keys in the Node2Flow dashboard' } },
      { title: 'Test Connection', content: 'Run the workflow to verify the MCP connection is working' },
    ],
  },
  {
    id: 'claude-ai',
    name: 'Claude.ai',
    auth: 'OAuth',
    recommended: true,
    description: "Connect via OAuth in Claude's custom connector settings.",
    copyLabel: 'Copy Server URL',
    copyValue: MCP_URL,
    color: '#d97706',
    guide: [
      { title: 'Open Claude.ai Settings', content: 'Go to **Settings \u2192 Connectors \u2192 Add custom connector**' },
      { title: 'Configure Connector', content: 'Enter the connector details:', copyItems: [{ label: 'Name', value: 'node2flow' }, { label: 'Remote MCP server URL', value: MCP_URL }] },
      { title: 'Authenticate', content: 'Log in using your Node2Flow account (email/password or social login)', note: { type: 'warning', title: 'Account Sync', content: 'If you used different login methods on Node2Flow and in this client (e.g., Google vs GitHub), log out from OAuth and re-authorize to sync your accounts.' } },
      { title: 'Start Using', content: 'You can now use Node2Flow tools directly in your Claude.ai conversations!', note: { type: 'info', title: 'Claude Desktop', content: 'The setup process is identical for Claude Desktop \u2014 just use the same connector configuration in the desktop app settings.' } },
    ],
  },
  {
    id: 'chatgpt',
    name: 'ChatGPT',
    auth: 'OAuth',
    description: 'Connect via OAuth custom connector in ChatGPT settings.',
    copyLabel: 'Copy Server URL',
    copyValue: MCP_URL,
    color: '#10a37f',
    guide: [
      { title: 'Open ChatGPT Settings', content: 'Go to **Settings \u2192 Connectors \u2192 Add custom connector**' },
      { title: 'Configure Connector', content: 'Enter the connector details:', copyItems: [{ label: 'Name', value: 'node2flow' }, { label: 'Server URL', value: MCP_URL }] },
      { title: 'Authenticate', content: 'Log in using your Node2Flow account' },
      { title: 'Start Using', content: 'Node2Flow tools are now available in your ChatGPT conversations!' },
    ],
  },
  {
    id: 'claude-code',
    name: 'Claude Code',
    auth: 'OAuth',
    description: 'Add MCP server via CLI command with OAuth authentication.',
    copyLabel: 'Copy CLI Command',
    copyValue: `claude mcp add node2flow ${MCP_URL} --transport http`,
    color: '#d97706',
    guide: [
      { title: 'Open Terminal', content: 'Open your terminal or command prompt' },
      { title: 'Run CLI Command', content: 'Run the following command to add Node2Flow:', copyItems: [{ label: 'Command', value: `claude mcp add node2flow ${MCP_URL} --transport http` }] },
      { title: 'Authenticate', content: 'A browser window will open. Log in with your Node2Flow account to authorize.' },
      { title: 'Start Using', content: 'Node2Flow tools are now available in Claude Code sessions!' },
    ],
  },
  {
    id: 'codex-cli',
    name: 'Codex CLI',
    auth: 'OAuth',
    description: 'Add MCP server via CLI command with OAuth authentication.',
    copyLabel: 'Copy CLI Command',
    copyValue: `codex mcp add ${MCP_URL}`,
    color: '#10a37f',
    guide: [
      { title: 'Open Terminal', content: 'Open your terminal' },
      { title: 'Run CLI Command', content: 'Run the following command:', copyItems: [{ label: 'Command', value: `codex mcp add ${MCP_URL}` }] },
      { title: 'Authenticate', content: 'Follow the OAuth prompt in your browser' },
      { title: 'Start Using', content: 'Node2Flow tools are now available in Codex CLI!' },
    ],
  },
  {
    id: 'cursor',
    name: 'Cursor',
    auth: 'API Key',
    description: 'Add MCP server in Cursor settings with Bearer token.',
    copyLabel: 'Copy Config',
    copyValue: JSON.stringify({ mcpServers: { "node2flow": { url: `${MCP_URL}/mcp`, headers: { Authorization: "Bearer YOUR_API_KEY" } } } }, null, 2),
    color: '#000000',
    guide: [
      { title: 'Open Cursor Settings', content: 'Go to **Cursor Settings \u2192 MCP** section' },
      { title: 'Add MCP Server', content: 'Add the following JSON configuration:', copyItems: [{ label: 'Config', value: JSON.stringify({ mcpServers: { "node2flow": { url: `${MCP_URL}/mcp`, headers: { Authorization: "Bearer YOUR_API_KEY" } } } }, null, 2) }] },
      { title: 'Add API Key', content: 'Replace `YOUR_API_KEY` with your Node2Flow API key from **Settings \u2192 API Keys**', note: { type: 'info', title: 'API Key', content: 'You can create a new API key in the Node2Flow dashboard under Settings \u2192 API Keys' } },
      { title: 'Restart', content: 'Restart Cursor to apply the changes' },
    ],
  },
  {
    id: 'windsurf',
    name: 'Windsurf',
    auth: 'API Key',
    description: 'Add MCP server in Windsurf settings with Bearer token.',
    copyLabel: 'Copy Config',
    copyValue: JSON.stringify({ mcpServers: { "node2flow": { url: `${MCP_URL}/mcp`, headers: { Authorization: "Bearer YOUR_API_KEY" } } } }, null, 2),
    color: '#06b6d4',
    guide: [
      { title: 'Open Windsurf Settings', content: 'Go to **Windsurf Settings \u2192 MCP** section' },
      { title: 'Add MCP Server', content: 'Add the following JSON configuration:', copyItems: [{ label: 'Config', value: JSON.stringify({ mcpServers: { "node2flow": { url: `${MCP_URL}/mcp`, headers: { Authorization: "Bearer YOUR_API_KEY" } } } }, null, 2) }] },
      { title: 'Add API Key', content: 'Replace `YOUR_API_KEY` with your Node2Flow API key from **Settings \u2192 API Keys**' },
      { title: 'Restart', content: 'Restart Windsurf to apply the changes' },
    ],
  },
  {
    id: 'warp',
    name: 'Warp',
    auth: 'OAuth',
    description: 'Add MCP server via settings with OAuth authentication.',
    copyLabel: 'Copy Config',
    copyValue: MCP_URL,
    color: '#01a4ff',
    guide: [
      { title: 'Open Warp Settings', content: 'Go to **Settings \u2192 MCP Servers**' },
      { title: 'Add Server', content: 'Add a new MCP server with the URL:', copyItems: [{ label: 'Server URL', value: MCP_URL }] },
      { title: 'Authenticate', content: 'Complete the OAuth flow in your browser' },
      { title: 'Start Using', content: 'Node2Flow tools are now available in Warp!' },
    ],
  },
  {
    id: 'kiro',
    name: 'Kiro',
    auth: 'OAuth',
    description: 'Add MCP server via mcp.json with OAuth authentication.',
    copyLabel: 'Copy Config',
    copyValue: JSON.stringify({ mcpServers: { "node2flow": { url: MCP_URL, type: "http" } } }, null, 2),
    color: '#7c3aed',
    guide: [
      { title: 'Open Project Settings', content: "Open your project's `.kiro/mcp.json` file (create if needed)" },
      { title: 'Add Config', content: 'Add the following configuration:', copyItems: [{ label: 'Config', value: JSON.stringify({ mcpServers: { "node2flow": { url: MCP_URL, type: "http" } } }, null, 2) }] },
      { title: 'Authenticate', content: 'Kiro will prompt you to authenticate via OAuth' },
      { title: 'Start Using', content: 'Node2Flow tools are now available in Kiro!' },
    ],
  },
  {
    id: 'gemini-cli',
    name: 'Gemini CLI',
    auth: 'OAuth',
    description: 'Add MCP server via settings.json with OAuth authentication.',
    copyLabel: 'Copy Config',
    copyValue: JSON.stringify({ mcpServers: { "node2flow": { url: MCP_URL } } }, null, 2),
    color: '#4285f4',
    guide: [
      { title: 'Open Settings', content: 'Open your `settings.json` configuration file' },
      { title: 'Add Config', content: 'Add the following MCP server configuration:', copyItems: [{ label: 'Config', value: JSON.stringify({ mcpServers: { "node2flow": { url: MCP_URL } } }, null, 2) }] },
      { title: 'Authenticate', content: 'Gemini CLI will prompt you to authenticate via OAuth' },
      { title: 'Start Using', content: 'Node2Flow tools are now available in Gemini CLI!' },
    ],
  },
  {
    id: 'raycast',
    name: 'Raycast',
    auth: 'API Key',
    description: 'Add MCP server via mcp-config.json with Bearer token.',
    copyLabel: 'Copy Config',
    copyValue: JSON.stringify({ mcpServers: { "node2flow": { url: `${MCP_URL}/mcp`, headers: { Authorization: "Bearer YOUR_API_KEY" } } } }, null, 2),
    color: '#ff6363',
    guide: [
      { title: 'Open Raycast Config', content: 'Edit your `mcp-config.json` file' },
      { title: 'Add Config', content: 'Add the following configuration:', copyItems: [{ label: 'Config', value: JSON.stringify({ mcpServers: { "node2flow": { url: `${MCP_URL}/mcp`, headers: { Authorization: "Bearer YOUR_API_KEY" } } } }, null, 2) }] },
      { title: 'Add API Key', content: 'Replace `YOUR_API_KEY` with your Node2Flow API key' },
      { title: 'Restart', content: 'Restart Raycast to load the MCP server' },
    ],
  },
  {
    id: 'opencode',
    name: 'OpenCode',
    auth: 'OAuth',
    description: 'Add MCP server via config file with OAuth authentication.',
    copyLabel: 'Copy Config',
    copyValue: JSON.stringify({ mcpServers: { "node2flow": { url: MCP_URL, type: "http" } } }, null, 2),
    color: '#6366f1',
    guide: [
      { title: 'Open Config', content: 'Open your OpenCode configuration file' },
      { title: 'Add Config', content: 'Add the following MCP server:', copyItems: [{ label: 'Config', value: JSON.stringify({ mcpServers: { "node2flow": { url: MCP_URL, type: "http" } } }, null, 2) }] },
      { title: 'Authenticate', content: 'OpenCode will prompt you to authenticate via OAuth' },
      { title: 'Start Using', content: 'Node2Flow tools are now available in OpenCode!' },
    ],
  },
  {
    id: 'genspark',
    name: 'Genspark',
    auth: 'API Key',
    description: 'Add MCP server via Tools settings with Streamable HTTP transport.',
    copyLabel: 'Copy Request Header',
    copyValue: `Authorization: Bearer YOUR_API_KEY`,
    color: '#3b82f6',
    guide: [
      { title: 'Open Tools Settings', content: 'Go to **Tools Settings** in Genspark' },
      { title: 'Add MCP Server', content: 'Add a new MCP server with Streamable HTTP transport', copyItems: [{ label: 'URL', value: `${MCP_URL}/mcp` }, { label: 'Authorization Header', value: 'Bearer YOUR_API_KEY' }] },
      { title: 'Add API Key', content: 'Replace `YOUR_API_KEY` with your Node2Flow API key' },
      { title: 'Start Using', content: 'Node2Flow tools are now available in Genspark!' },
    ],
  },
  {
    id: 'huggingchat',
    name: 'HuggingChat',
    auth: 'API Key',
    description: 'Add MCP server with Bearer token in HTTP headers.',
    copyLabel: 'Copy Auth Header',
    copyValue: `Authorization: Bearer YOUR_API_KEY`,
    color: '#ffd21e',
    guide: [
      { title: 'Open Settings', content: 'Go to **Settings** in HuggingChat' },
      { title: 'Add MCP Server', content: 'Add a new MCP server with Bearer token authentication', copyItems: [{ label: 'URL', value: `${MCP_URL}/mcp` }, { label: 'Authorization Header', value: 'Bearer YOUR_API_KEY' }] },
      { title: 'Add API Key', content: 'Replace `YOUR_API_KEY` with your Node2Flow API key' },
      { title: 'Start Using', content: 'Node2Flow tools are now available in HuggingChat!' },
    ],
  },
  {
    id: 'cursor-ide',
    name: 'Cursor IDE',
    auth: 'OAuth',
    description: 'One-click install with OAuth authentication.',
    copyLabel: 'Add to Cursor',
    copyValue: MCP_URL,
    color: '#000000',
    guide: [
      { title: 'Open Cursor Settings', content: 'Go to **Cursor Settings \u2192 MCP** section' },
      { title: 'Add Server URL', content: 'Add Node2Flow as an MCP server:', copyItems: [{ label: 'URL', value: MCP_URL }] },
      { title: 'Authenticate', content: 'Cursor will automatically start the OAuth flow. Log in with your Node2Flow account.' },
      { title: 'Start Using', content: 'Node2Flow tools are now available in Cursor!' },
    ],
  },
  {
    id: 'vscode',
    name: 'VS Code',
    auth: 'API Key',
    description: 'Add to .vscode/mcp.json with Bearer token authentication.',
    copyLabel: 'Copy Config',
    copyValue: JSON.stringify({ mcpServers: { "node2flow": { url: `${MCP_URL}/mcp`, headers: { Authorization: "Bearer YOUR_API_KEY" } } } }, null, 2),
    color: '#007acc',
    guide: [
      { title: 'Open MCP Config', content: 'Create or edit `.vscode/mcp.json` in your project root' },
      { title: 'Add Config', content: 'Add the following configuration:', copyItems: [{ label: 'Config', value: JSON.stringify({ mcpServers: { "node2flow": { url: `${MCP_URL}/mcp`, headers: { Authorization: "Bearer YOUR_API_KEY" } } } }, null, 2) }] },
      { title: 'Add API Key', content: 'Replace `YOUR_API_KEY` with your Node2Flow API key' },
      { title: 'Reload', content: 'Reload VS Code window to apply changes (Ctrl+Shift+P \u2192 Reload Window)' },
    ],
  },
  {
    id: 'google-antigravity',
    name: 'Google Antigravity',
    auth: 'API Key',
    description: 'Add MCP server via raw config with Bearer token.',
    copyLabel: 'Copy Config',
    copyValue: JSON.stringify({ mcpServers: { "node2flow": { url: `${MCP_URL}/mcp`, headers: { Authorization: "Bearer YOUR_API_KEY" } } } }, null, 2),
    color: '#34a853',
    guide: [
      { title: 'Open Settings', content: 'Go to **Settings** in Google Antigravity' },
      { title: 'Add Config', content: 'Add the MCP server with Bearer token authentication:', copyItems: [{ label: 'Config', value: JSON.stringify({ mcpServers: { "node2flow": { url: `${MCP_URL}/mcp`, headers: { Authorization: "Bearer YOUR_API_KEY" } } } }, null, 2) }] },
      { title: 'Add API Key', content: 'Replace `YOUR_API_KEY` with your Node2Flow API key' },
      { title: 'Start Using', content: 'Node2Flow tools are now available!' },
    ],
  },
  {
    id: 'lm-studio',
    name: 'LM Studio',
    auth: 'API Key',
    description: 'Add MCP server via mcp.json with Bearer token.',
    copyLabel: 'Copy Config',
    copyValue: JSON.stringify({ mcpServers: { "node2flow": { url: `${MCP_URL}/mcp`, headers: { Authorization: "Bearer YOUR_API_KEY" } } } }, null, 2),
    color: '#22c55e',
    guide: [
      { title: 'Open MCP Config', content: 'Edit your `mcp.json` configuration file' },
      { title: 'Add Config', content: 'Add the following MCP server:', copyItems: [{ label: 'Config', value: JSON.stringify({ mcpServers: { "node2flow": { url: `${MCP_URL}/mcp`, headers: { Authorization: "Bearer YOUR_API_KEY" } } } }, null, 2) }] },
      { title: 'Add API Key', content: 'Replace `YOUR_API_KEY` with your Node2Flow API key' },
      { title: 'Start Using', content: 'Node2Flow tools are now available in LM Studio!' },
    ],
  },
  {
    id: 'anythingllm',
    name: 'AnythingLLM',
    auth: 'API Key',
    description: 'Add MCP server via config file with Bearer token.',
    copyLabel: 'Copy Config',
    copyValue: JSON.stringify({ mcpServers: { "node2flow": { url: `${MCP_URL}/mcp`, headers: { Authorization: "Bearer YOUR_API_KEY" } } } }, null, 2),
    color: '#8b5cf6',
    guide: [
      { title: 'Open Settings', content: 'Go to **Settings** in AnythingLLM' },
      { title: 'Add Config', content: 'Add the MCP server configuration:', copyItems: [{ label: 'Config', value: JSON.stringify({ mcpServers: { "node2flow": { url: `${MCP_URL}/mcp`, headers: { Authorization: "Bearer YOUR_API_KEY" } } } }, null, 2) }] },
      { title: 'Add API Key', content: 'Replace `YOUR_API_KEY` with your Node2Flow API key' },
      { title: 'Start Using', content: 'Node2Flow tools are now available in AnythingLLM!' },
    ],
  },
  {
    id: 'manus-ai',
    name: 'Manus AI',
    auth: 'API Key',
    description: 'Add custom MCP server in Manus Connectors with Bearer token.',
    copyLabel: 'Copy Server URL',
    copyValue: `${MCP_URL}/mcp`,
    color: '#ef4444',
    guide: [
      { title: 'Open Manus Connectors', content: 'Go to **Connectors** in Manus AI settings' },
      { title: 'Add MCP Server', content: 'Add a custom MCP server:', copyItems: [{ label: 'Server URL', value: `${MCP_URL}/mcp` }] },
      { title: 'Configure Auth', content: 'Add your Node2Flow API key as Bearer token', note: { type: 'info', title: 'API Key', content: 'Get your API key from Settings \u2192 API Keys in the Node2Flow dashboard' } },
      { title: 'Start Using', content: 'Node2Flow tools are now available in Manus AI!' },
    ],
  },
  {
    id: 'elevenlabs',
    name: 'ElevenLabs Agent',
    auth: 'API Key',
    description: 'Add custom MCP server in ElevenLabs Agent settings with Bearer token.',
    copyLabel: 'Copy Server URL',
    copyValue: `${MCP_URL}/mcp`,
    color: '#000000',
    guide: [
      { title: 'Open Agent Settings', content: 'Go to your **ElevenLabs Agent** configuration' },
      { title: 'Add MCP Server', content: 'Add a custom MCP server:', copyItems: [{ label: 'Server URL', value: `${MCP_URL}/mcp` }] },
      { title: 'Configure Auth', content: 'Add your Node2Flow API key as Bearer token:', copyItems: [{ label: 'Authorization Header', value: 'Bearer YOUR_API_KEY' }], note: { type: 'info', title: 'API Key', content: 'Get your API key from Settings → API Keys in the Node2Flow dashboard' } },
      { title: 'Start Using', content: 'Node2Flow tools are now available in your ElevenLabs Agent!' },
    ],
  },
  {
    id: 'other',
    name: 'Other MCP Clients',
    auth: 'API Key',
    description: 'Generic setup for any MCP-compatible client.',
    copyLabel: 'Copy Server URL',
    copyValue: `${MCP_URL}/mcp`,
    color: '#6b7280',
    guide: [
      { title: 'Find MCP Settings', content: 'Open the MCP server configuration in your client' },
      { title: 'Add Server', content: 'Add Node2Flow as an MCP server:', copyItems: [{ label: 'Server URL', value: `${MCP_URL}/mcp` }, { label: 'Authorization Header', value: 'Bearer YOUR_API_KEY' }] },
      { title: 'Add API Key', content: 'Replace `YOUR_API_KEY` with your Node2Flow API key from **Settings \u2192 API Keys**', note: { type: 'info', title: 'OAuth Clients', content: `For OAuth-compatible clients, use the server URL without /mcp suffix: ${MCP_URL}` } },
      { title: 'Start Using', content: 'Node2Flow tools are now available in your MCP client!' },
    ],
  },
  {
    id: 'request',
    name: 'Your AI Agent not listed?',
    auth: '',
    description: 'Let us know which client you\'d like to see integrated.',
    copyLabel: 'Request Integration',
    copyValue: '',
    linkUrl: 'mailto:support@node2flow.net?subject=MCP%20Client%20Integration%20Request',
    color: '#374151',
  },
];

// ============================================
// Copy Button Helper
// ============================================

function CopyButton({ value, label }: { value: string; label?: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch { /* clipboard not available */ }
  }

  return (
    <button
      onClick={handleCopy}
      className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
      title={label ? `Copy ${label}` : 'Copy'}
    >
      {copied ? <Check className="h-3 w-3 text-green-500" /> : <Copy className="h-3 w-3" />}
      {copied ? 'Copied' : 'Copy'}
    </button>
  );
}

// ============================================
// Guide Dialog
// ============================================

function renderMarkdownBold(text: string) {
  const parts = text.split(/\*\*(.*?)\*\*/g);
  return parts.map((part, i) =>
    i % 2 === 1 ? <strong key={i}>{part}</strong> : <span key={i}>{part}</span>
  );
}

function GuideDialog({ client, open, onOpenChange }: { client: McpClient | null; open: boolean; onOpenChange: (open: boolean) => void }) {
  if (!client?.guide) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Step-by-Step Guide</DialogTitle>
          <DialogDescription>{client.name}</DialogDescription>
        </DialogHeader>
        <div className="overflow-y-auto max-h-[70vh] space-y-5 pr-1">
          {client.guide.map((step, idx) => (
            <div key={idx} className="space-y-2">
              <div className="flex items-baseline gap-2">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">
                  {idx + 1}
                </span>
                <h4 className="font-semibold text-sm">{step.title}</h4>
              </div>
              <div className="ml-8 space-y-2">
                <p className="text-sm text-muted-foreground">{renderMarkdownBold(step.content)}</p>
                {step.copyItems?.map((item, ci) => (
                  <div key={ci} className="rounded-md border bg-muted/50 px-3 py-2">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-medium text-muted-foreground">{item.label}</span>
                      <CopyButton value={item.value} label={item.label} />
                    </div>
                    <pre className="text-xs break-all whitespace-pre-wrap font-mono text-foreground">{item.value}</pre>
                  </div>
                ))}
                {step.note && (
                  <div className={`flex gap-2 rounded-md border px-3 py-2 text-xs ${
                    step.note.type === 'warning'
                      ? 'border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-400'
                      : 'border-blue-500/30 bg-blue-500/10 text-blue-700 dark:text-blue-400'
                  }`}>
                    {step.note.type === 'warning'
                      ? <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
                      : <Info className="h-4 w-4 shrink-0 mt-0.5" />
                    }
                    <div>
                      <span className="font-semibold">{step.note.title}: </span>
                      {step.note.content}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ============================================
// Client Card
// ============================================

function ClientCard({ client, onShowGuide }: { client: McpClient; onShowGuide?: () => void }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(client.copyValue);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch { /* clipboard not available */ }
  }

  const isRequestCard = client.id === 'request';

  return (
    <div className="rounded-lg border border-border bg-card p-4 flex flex-col gap-3">
      <div className="flex items-start gap-3">
        <div
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-white text-sm font-bold"
          style={{ backgroundColor: client.color }}
        >
          {client.icon ? (
            <img src={client.icon} alt="" className="h-5 w-5" />
          ) : isRequestCard ? (
            <Plus className="h-5 w-5" />
          ) : (
            client.name.charAt(0)
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-sm">{client.name}</span>
            {client.recommended && (
              <Badge variant="default" className="bg-orange-600 hover:bg-orange-600 text-[10px] px-1.5 py-0">Recommended</Badge>
            )}
            {client.auth && (
              <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                {client.auth}
              </Badge>
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{client.description}</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        {isRequestCard ? (
          <Button
            variant="outline"
            size="sm"
            className="flex-1 h-8 text-xs"
            asChild
          >
            <a href={client.linkUrl} target="_blank" rel="noopener noreferrer">
              <MessageSquarePlus className="h-3 w-3 mr-1.5" />
              {client.copyLabel}
            </a>
          </Button>
        ) : (
          <Button
            variant="outline"
            size="sm"
            className="flex-1 h-8 text-xs"
            onClick={handleCopy}
          >
            {copied ? <Check className="h-3 w-3 mr-1.5" /> : <Copy className="h-3 w-3 mr-1.5" />}
            {copied ? 'Copied!' : client.copyLabel}
          </Button>
        )}
        {!isRequestCard && (
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 shrink-0"
            onClick={onShowGuide}
          >
            <BookOpen className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}

// ============================================
// Usage Data Table
// ============================================

const columns: ColumnDef<ClientUsageStats>[] = [
  {
    accessorKey: 'client_name',
    header: 'Client',
    cell: ({ row }) => <span className="font-medium">{row.getValue('client_name')}</span>,
  },
  {
    accessorKey: 'total_requests',
    header: ({ column }) => (
      <Button variant="ghost" size="sm" className="-ml-3 h-8" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
        Requests <ArrowUpDown className="ml-1 h-3 w-3" />
      </Button>
    ),
    cell: ({ row }) => (
      <span className="tabular-nums">{(row.getValue('total_requests') as number).toLocaleString()}</span>
    ),
  },
  {
    accessorKey: 'successes',
    header: 'Success',
    cell: ({ row }) => (
      <span className="tabular-nums text-green-500">{(row.getValue('successes') as number).toLocaleString()}</span>
    ),
  },
  {
    accessorKey: 'errors',
    header: 'Errors',
    cell: ({ row }) => {
      const errors = row.getValue('errors') as number;
      return (
        <span className={`tabular-nums ${errors > 0 ? 'text-red-500' : 'text-muted-foreground'}`}>
          {errors.toLocaleString()}
        </span>
      );
    },
  },
  {
    accessorKey: 'connections_used',
    header: 'Connections',
    cell: ({ row }) => (
      <span className="tabular-nums">{(row.getValue('connections_used') as number).toLocaleString()}</span>
    ),
  },
  {
    accessorKey: 'last_seen_at',
    header: 'Last Seen',
    cell: ({ row }) => {
      const date = row.getValue('last_seen_at') as string | null;
      if (!date) return <span className="text-muted-foreground text-sm">Never</span>;
      return <span className="text-sm text-muted-foreground">{new Date(date).toLocaleDateString()}</span>;
    },
  },
];

const periods = [7, 30, 90, 180] as const;
const periodLabels: Record<number, string> = { 7: '7 days', 30: '30 days', 90: '90 days', 180: '180 days' };

// ============================================
// Page Component
// ============================================

export default function Clients() {
  const [search, setSearch] = useState('');
  const [clients, setClients] = useState<ClientUsageStats[]>([]);
  const [period, setPeriod] = useState<7 | 30 | 90 | 180>(7);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [sorting, setSorting] = useState<SortingState>([]);
  const [guideClient, setGuideClient] = useState<McpClient | null>(null);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      setError('');
      const res = await getClientUsage(period);
      if (res.data) setClients(res.data.clients);
      else setError(res.error?.message || 'Failed to load');
      setLoading(false);
    }
    fetchData();
  }, [period]);

  const filteredClients = useMemo(() => {
    if (!search.trim()) return mcpClients;
    const q = search.toLowerCase();
    return mcpClients.filter(c =>
      c.name.toLowerCase().includes(q) || c.auth.toLowerCase().includes(q)
    );
  }, [search]);

  const table = useReactTable({
    data: clients,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    state: { sorting },
    initialState: { pagination: { pageSize: 10 } },
  });

  return (
    <div className="@container/main flex flex-1 flex-col gap-2">
      <div className="flex flex-col gap-6 py-4 md:gap-8 md:py-6">

        {/* Connect Client — Card Grid */}
        <div className="px-4 lg:px-6 space-y-4">
          <div>
            <h2 className="text-xl font-bold">Connect Client</h2>
            <p className="text-sm text-muted-foreground">Choose your MCP client and follow the setup instructions</p>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search clients..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {filteredClients.map((client) => (
              <ClientCard key={client.id} client={client} onShowGuide={() => setGuideClient(client)} />
            ))}
            {filteredClients.length === 0 && (
              <div className="col-span-full text-center py-8 text-muted-foreground text-sm">
                No clients match your search.
              </div>
            )}
          </div>
        </div>

        {/* Client Usage — Data Table */}
        <div className="space-y-4">
          <div className="px-4 lg:px-6 flex items-center justify-between">
            <h2 className="text-xl font-bold">Client Activity</h2>
            <div className="flex items-center gap-2">
              {periods.map((p) => (
                <Button
                  key={p}
                  variant={period === p ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setPeriod(p)}
                >
                  {periodLabels[p]}
                </Button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : error ? (
            <div className="px-4 lg:px-6 text-sm text-red-500">{error}</div>
          ) : (
            <div className="space-y-4 px-4 lg:px-6">
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    {table.getHeaderGroups().map((headerGroup) => (
                      <TableRow key={headerGroup.id}>
                        {headerGroup.headers.map((header) => (
                          <TableHead key={header.id}>
                            {header.isPlaceholder
                              ? null
                              : flexRender(header.column.columnDef.header, header.getContext())}
                          </TableHead>
                        ))}
                      </TableRow>
                    ))}
                  </TableHeader>
                  <TableBody>
                    {table.getRowModel().rows?.length ? (
                      table.getRowModel().rows.map((row) => (
                        <TableRow key={row.id}>
                          {row.getVisibleCells().map((cell) => (
                            <TableCell key={cell.id}>
                              {flexRender(cell.column.columnDef.cell, cell.getContext())}
                            </TableCell>
                          ))}
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={columns.length} className="h-24 text-center text-muted-foreground">
                          No client activity yet.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>

              {table.getPageCount() > 1 && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">
                    Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
                  </span>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => table.previousPage()}
                      disabled={!table.getCanPreviousPage()}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => table.nextPage()}
                      disabled={!table.getCanNextPage()}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

      </div>

      <GuideDialog
        client={guideClient}
        open={guideClient !== null}
        onOpenChange={(open) => { if (!open) setGuideClient(null); }}
      />
    </div>
  );
}
