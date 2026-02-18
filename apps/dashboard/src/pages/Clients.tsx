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
} from '@node2flow/dashboard-core';
import { ArrowUpDown, ChevronLeft, ChevronRight, Loader2, Copy, Check, Search, BookOpen, MessageSquarePlus, Plus } from 'lucide-react';
import { getClientUsage, type ClientUsageStats } from '@/lib/platform-api';

// ============================================
// MCP Client Card Grid
// ============================================

const MCP_URL = 'https://mcp.node2flow.net';

interface McpClient {
  id: string;
  name: string;
  auth: 'OAuth' | 'API Key' | '';
  recommended?: boolean;
  description: string;
  copyLabel: string;
  copyValue: string;
  docsUrl?: string;
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
  },
  {
    id: 'claude-ai',
    name: 'Claude.ai',
    auth: 'OAuth',
    recommended: true,
    description: "Connect via OAuth in Claude's custom connector settings.",
    copyLabel: 'Copy Server URL',
    copyValue: MCP_URL,
    docsUrl: 'https://docs.anthropic.com/en/docs/agents-and-tools/remote-mcp-servers',
    color: '#d97706',
  },
  {
    id: 'chatgpt',
    name: 'ChatGPT',
    auth: 'OAuth',
    description: 'Connect via OAuth custom connector in ChatGPT settings.',
    copyLabel: 'Copy Server URL',
    copyValue: MCP_URL,
    color: '#10a37f',
  },
  {
    id: 'claude-code',
    name: 'Claude Code',
    auth: 'OAuth',
    description: 'Add MCP server via CLI command with OAuth authentication.',
    copyLabel: 'Copy CLI Command',
    copyValue: `claude mcp add node2flow ${MCP_URL} --transport http`,
    docsUrl: 'https://docs.anthropic.com/en/docs/claude-code/mcp',
    color: '#d97706',
  },
  {
    id: 'codex-cli',
    name: 'Codex CLI',
    auth: 'OAuth',
    description: 'Add MCP server via CLI command with OAuth authentication.',
    copyLabel: 'Copy CLI Command',
    copyValue: `codex mcp add ${MCP_URL}`,
    color: '#10a37f',
  },
  {
    id: 'cursor',
    name: 'Cursor',
    auth: 'API Key',
    description: 'Add MCP server in Cursor settings with Bearer token.',
    copyLabel: 'Copy Config',
    copyValue: JSON.stringify({ mcpServers: { "node2flow": { url: `${MCP_URL}/mcp`, headers: { Authorization: "Bearer YOUR_API_KEY" } } } }, null, 2),
    color: '#000000',
  },
  {
    id: 'windsurf',
    name: 'Windsurf',
    auth: 'API Key',
    description: 'Add MCP server in Windsurf settings with Bearer token.',
    copyLabel: 'Copy Config',
    copyValue: JSON.stringify({ mcpServers: { "node2flow": { url: `${MCP_URL}/mcp`, headers: { Authorization: "Bearer YOUR_API_KEY" } } } }, null, 2),
    color: '#06b6d4',
  },
  {
    id: 'warp',
    name: 'Warp',
    auth: 'OAuth',
    description: 'Add MCP server via settings with OAuth authentication.',
    copyLabel: 'Copy Config',
    copyValue: MCP_URL,
    color: '#01a4ff',
  },
  {
    id: 'kiro',
    name: 'Kiro',
    auth: 'OAuth',
    description: 'Add MCP server via mcp.json with OAuth authentication.',
    copyLabel: 'Copy Config',
    copyValue: JSON.stringify({ mcpServers: { "node2flow": { url: MCP_URL, type: "http" } } }, null, 2),
    color: '#7c3aed',
  },
  {
    id: 'gemini-cli',
    name: 'Gemini CLI',
    auth: 'OAuth',
    description: 'Add MCP server via settings.json with OAuth authentication.',
    copyLabel: 'Copy Config',
    copyValue: JSON.stringify({ mcpServers: { "node2flow": { url: MCP_URL } } }, null, 2),
    color: '#4285f4',
  },
  {
    id: 'raycast',
    name: 'Raycast',
    auth: 'API Key',
    description: 'Add MCP server via mcp-config.json with Bearer token.',
    copyLabel: 'Copy Config',
    copyValue: JSON.stringify({ mcpServers: { "node2flow": { url: `${MCP_URL}/mcp`, headers: { Authorization: "Bearer YOUR_API_KEY" } } } }, null, 2),
    color: '#ff6363',
  },
  {
    id: 'opencode',
    name: 'OpenCode',
    auth: 'OAuth',
    description: 'Add MCP server via config file with OAuth authentication.',
    copyLabel: 'Copy Config',
    copyValue: JSON.stringify({ mcpServers: { "node2flow": { url: MCP_URL, type: "http" } } }, null, 2),
    color: '#6366f1',
  },
  {
    id: 'genspark',
    name: 'Genspark',
    auth: 'API Key',
    description: 'Add MCP server via Tools settings with Streamable HTTP transport.',
    copyLabel: 'Copy Request Header',
    copyValue: `Authorization: Bearer YOUR_API_KEY`,
    color: '#3b82f6',
  },
  {
    id: 'huggingchat',
    name: 'HuggingChat',
    auth: 'API Key',
    description: 'Add MCP server with Bearer token in HTTP headers.',
    copyLabel: 'Copy Auth Header',
    copyValue: `Authorization: Bearer YOUR_API_KEY`,
    color: '#ffd21e',
  },
  {
    id: 'cursor-ide',
    name: 'Cursor IDE',
    auth: 'OAuth',
    description: 'One-click install with OAuth authentication.',
    copyLabel: 'Add to Cursor',
    copyValue: MCP_URL,
    color: '#000000',
  },
  {
    id: 'vscode',
    name: 'VS Code',
    auth: 'API Key',
    description: 'Add to .vscode/mcp.json with Bearer token authentication.',
    copyLabel: 'Copy Config',
    copyValue: JSON.stringify({ mcpServers: { "node2flow": { url: `${MCP_URL}/mcp`, headers: { Authorization: "Bearer YOUR_API_KEY" } } } }, null, 2),
    color: '#007acc',
  },
  {
    id: 'google-antigravity',
    name: 'Google Antigravity',
    auth: 'API Key',
    description: 'Add MCP server via raw config with Bearer token.',
    copyLabel: 'Copy Config',
    copyValue: JSON.stringify({ mcpServers: { "node2flow": { url: `${MCP_URL}/mcp`, headers: { Authorization: "Bearer YOUR_API_KEY" } } } }, null, 2),
    color: '#34a853',
  },
  {
    id: 'lm-studio',
    name: 'LM Studio',
    auth: 'API Key',
    description: 'Add MCP server via mcp.json with Bearer token.',
    copyLabel: 'Copy Config',
    copyValue: JSON.stringify({ mcpServers: { "node2flow": { url: `${MCP_URL}/mcp`, headers: { Authorization: "Bearer YOUR_API_KEY" } } } }, null, 2),
    color: '#22c55e',
  },
  {
    id: 'anythingllm',
    name: 'AnythingLLM',
    auth: 'API Key',
    description: 'Add MCP server via config file with Bearer token.',
    copyLabel: 'Copy Config',
    copyValue: JSON.stringify({ mcpServers: { "node2flow": { url: `${MCP_URL}/mcp`, headers: { Authorization: "Bearer YOUR_API_KEY" } } } }, null, 2),
    color: '#8b5cf6',
  },
  {
    id: 'manus-ai',
    name: 'Manus AI',
    auth: 'API Key',
    description: 'Add custom MCP server in Manus Connectors with Bearer token.',
    copyLabel: 'Copy Server URL',
    copyValue: `${MCP_URL}/mcp`,
    color: '#ef4444',
  },
  {
    id: 'elevenlabs',
    name: 'ElevenLabs Agent',
    auth: 'API Key',
    description: 'Add custom MCP server in ElevenLabs Agent settings with Bearer token.',
    copyLabel: 'Copy Server URL',
    copyValue: `${MCP_URL}/mcp`,
    color: '#000000',
  },
  {
    id: 'other',
    name: 'Other MCP Clients',
    auth: 'API Key',
    description: 'Generic setup for any MCP-compatible client.',
    copyLabel: 'Copy Server URL',
    copyValue: `${MCP_URL}/mcp`,
    color: '#6b7280',
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

function ClientCard({ client }: { client: McpClient }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    await navigator.clipboard.writeText(client.copyValue);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
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
        {client.docsUrl && (
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 shrink-0"
            asChild
          >
            <a href={client.docsUrl} target="_blank" rel="noopener noreferrer">
              <BookOpen className="h-4 w-4" />
            </a>
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

  useEffect(() => {
    fetchData();
  }, [period]);

  async function fetchData() {
    setLoading(true);
    setError('');
    const res = await getClientUsage(period);
    if (res.data) setClients(res.data.clients);
    else setError(res.error?.message || 'Failed to load');
    setLoading(false);
  }

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
              <ClientCard key={client.id} client={client} />
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
    </div>
  );
}
