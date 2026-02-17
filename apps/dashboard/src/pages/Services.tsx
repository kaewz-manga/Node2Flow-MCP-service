import { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import type { Connection } from '@node2flow/dashboard-core';
import {
  getConnections,
  Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter,
  Button, Alert, AlertDescription, Badge, Separator, Input,
  Table, TableHeader, TableBody, TableHead, TableRow, TableCell,
  Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious, PaginationEllipsis,
  Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue,
} from '@node2flow/dashboard-core';

import { plugins } from '../plugins/registry';
import type { AppPlugin } from '../plugins/registry';
import {
  ArrowRight,
  Loader2,
  AlertCircle,
  Globe,
  Search,
  ArrowUpDown,
} from 'lucide-react';

// Tool count per plugin (from gateway)
const TOOL_COUNTS: Record<string, number> = {
  n8n: 27,
  wordpress: 20,
  'cl-n8n-mcp': 20,
  'gemini-rag': 12,
  line: 25,
  telegram: 27,
  notion: 25,
  'notion-official': 22,
  'line-official': 12,
  playwright: 22,
  'google-workspace': 54,
  slack: 38,
  airtable: 18,
  youtube: 20,
  postgrest: 10,
  bitkub: 28,
  binance: 23,
  'binance-th': 27,
  'google-sheets': 23,
  'google-drive': 23,
  'google-docs': 26,
  supabase: 31,
  sqlite: 15,
  gmail: 20,
  'google-calendar': 28,
  github: 26,
  cloudflare: 25,
  browserbase: 9,
  qdrant: 2,
  'facebook-pages': 28,
  instagram: 25,
};

// Brand logos — local for custom, CDN for standard
const SERVICE_LOGOS: Record<string, string> = {
  n8n: '/logos/n8n.svg?v=2',
  wordpress: '/logos/wordpress.svg?v=2',
  'cl-n8n-mcp': '/logos/n8n-alt.svg?v=2',
  'gemini-rag': '/logos/gemini.png?v=2',
  line: '/logos/line.png?v=2',
  'line-official': '/logos/line.png?v=2',
  telegram: '/logos/telegram.svg?v=2',
  slack: '/logos/slack.png?v=2',
  notion: '/logos/notion.svg?v=2',
  'notion-official': '/logos/notion.svg?v=2',
  playwright: '/logos/playwright.svg?v=2',
  'google-workspace': '/logos/google.svg?v=2',
  airtable: '/logos/airtable.svg?v=2',
  youtube: '/logos/youtube.svg?v=2',
  postgrest: '/logos/postgrest.png?v=2',
  bitkub: '/logos/bitkub.png?v=3',
  binance: '/logos/binance.png?v=2',
  'binance-th': '/logos/binance.png?v=2',
  'google-sheets': '/logos/google-sheets.svg?v=2',
  'google-drive': '/logos/google-drive.svg?v=2',
  'google-docs': '/logos/google-docs.svg?v=2',
  supabase: '/logos/supabase.svg?v=2',
  sqlite: '/logos/sqlite.png?v=3',
  gmail: '/logos/gmail.svg?v=2',
  'google-calendar': '/logos/google-calendar.svg?v=2',
  context7: '/logos/context7.svg?v=2',
  github: '/logos/github.svg?v=2',
  cloudflare: '/logos/cloudflare.svg?v=2',
  browserbase: '/logos/browserbase.svg?v=3',
  qdrant: '/logos/qdrant.svg?v=3',
  'facebook-pages': '/logos/facebook.svg?v=2',
  instagram: '/logos/instagram.svg?v=2',
};

export default function Services() {
  const [connections, setConnections] = useState<Connection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortAsc, setSortAsc] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  useEffect(() => {
    async function fetchData() {
      try {
        const connectionsRes = await getConnections();
        if (connectionsRes.success && connectionsRes.data) {
          setConnections(connectionsRes.data.connections);
        }
      } catch {
        setError('Failed to load services data');
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  const getPlugin = (productType: string): AppPlugin | undefined =>
    plugins.find(p => p.id === productType);

  // Filter + sort connections
  const filteredConnections = useMemo(() => {
    const q = searchQuery.toLowerCase();
    const filtered = connections.filter(conn => {
      const plugin = getPlugin(conn.product_type);
      return conn.name.toLowerCase().includes(q)
        || (plugin?.name || conn.product_type).toLowerCase().includes(q);
    });
    filtered.sort((a, b) => {
      const cmp = a.name.localeCompare(b.name);
      return sortAsc ? cmp : -cmp;
    });
    return filtered;
  }, [connections, searchQuery, sortAsc]);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filteredConnections.length / rowsPerPage));
  const paginatedConnections = filteredConnections.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  // Page numbers with ellipsis
  const paginationPages = useMemo(() => {
    const pages: (number | '...')[] = [];
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (currentPage > 3) pages.push('...');
      for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
        pages.push(i);
      }
      if (currentPage < totalPages - 2) pages.push('...');
      pages.push(totalPages);
    }
    return pages;
  }, [totalPages, currentPage]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  const connectedServices = new Set(connections.map(c => c.product_type)).size;

  return (
    <div className="space-y-6 overflow-x-hidden">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Services</h1>
        <p className="text-muted-foreground mt-1">
          {connectedServices}/{plugins.length} services connected — {plugins.reduce((sum, p) => sum + (TOOL_COUNTS[p.id] || 0), 0)} tools available
        </p>
      </div>

      <Separator />

      {/* Services Grid — Compact cards */}
      <div>
        <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2">
          {plugins.map((plugin) => {
            const pluginConns = connections.filter(c => c.product_type === plugin.id);
            const isConnected = pluginConns.length > 0;
            const connectionsHref = plugin.sidebarItems[0]?.href || `/${plugin.id}`;
            const PluginIcon = plugin.icon;
            const logoUrl = SERVICE_LOGOS[plugin.id];

            return (
              <Link
                key={plugin.id}
                to={connectionsHref}
                className={`block rounded-md border bg-card p-2 transition-all hover:shadow-md hover:border-primary/40 ${isConnected ? 'border-l-[3px] border-l-emerald-500' : 'border-border/60'}`}
              >
                <div className="flex items-center gap-2">
                  {logoUrl ? (
                    <img src={logoUrl} alt={plugin.name} className="h-5 w-5 shrink-0" />
                  ) : (
                    <PluginIcon className={`h-5 w-5 shrink-0 ${isConnected ? 'text-emerald-400' : 'text-muted-foreground'}`} />
                  )}
                  <span className="text-xs font-medium truncate">{plugin.name}</span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Connections Table */}
      <Card className="bg-black border-border/60 max-w-4xl mx-auto">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Your Connections</CardTitle>
          <CardDescription>
            {connections.length > 0
              ? `${connections.length} active connection${connections.length > 1 ? 's' : ''} across ${connectedServices} service${connectedServices > 1 ? 's' : ''}`
              : 'No connections yet. Choose a service above to get started.'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {connections.length > 0 ? (
            <>
              {/* Search filter */}
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by connection name or service..."
                  value={searchQuery}
                  onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                  className="pl-9 h-9"
                />
              </div>

              <div className="rounded-md border border-border/60 overflow-x-auto">
                <Table className="min-w-0">
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[1%] text-center h-8 px-2">Status</TableHead>
                      <TableHead className="w-[40%] h-8 px-2">
                        <button
                          onClick={() => setSortAsc(prev => !prev)}
                          className="flex items-center gap-1 hover:text-foreground transition-colors"
                        >
                          Name
                          <ArrowUpDown className="h-3 w-3" />
                        </button>
                      </TableHead>
                      <TableHead className="text-center h-8 px-2">Service</TableHead>
                      <TableHead className="w-[1%] whitespace-nowrap text-center h-8 px-2"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedConnections.map((conn) => {
                      const plugin = getPlugin(conn.product_type);
                      const ConnIcon = plugin?.icon;
                      const connHref = plugin?.sidebarItems[0]?.href || '/dashboard';
                      return (
                        <TableRow key={conn.id}>
                          <TableCell className="text-center py-2 px-2">
                            <div className={`w-2 h-2 rounded-full mx-auto ${conn.status === 'active' ? 'bg-green-400' : 'bg-muted-foreground'}`} />
                          </TableCell>
                          <TableCell className="font-medium text-sm py-2 px-2">
                            {conn.name}
                          </TableCell>
                          <TableCell className="text-center py-2 px-2">
                            <div className="flex items-center justify-center gap-1.5">
                              {SERVICE_LOGOS[conn.product_type] ? (
                                <img src={SERVICE_LOGOS[conn.product_type]} alt="" className="h-3.5 w-3.5" />
                              ) : (
                                ConnIcon && <ConnIcon className="h-3.5 w-3.5 text-muted-foreground" />
                              )}
                              <Badge variant="secondary" className="text-[11px] px-1.5 py-0">
                                {plugin?.name || conn.product_type}
                              </Badge>
                            </div>
                          </TableCell>
                          <TableCell className="text-center py-2 px-2">
                            <Button variant="outline" size="sm" asChild className="h-6 text-xs px-2">
                              <Link to={connHref}>
                                Manage
                                <ArrowRight className="h-3 w-3 ml-1" />
                              </Link>
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                    {paginatedConnections.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                          No connections match "{searchQuery}"
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              {filteredConnections.length > 0 && (
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mt-4">
                  <div className="flex items-center gap-2">
                    <span className="text-xs sm:text-sm text-muted-foreground whitespace-nowrap">Rows per page</span>
                    <Select value={String(rowsPerPage)} onValueChange={(v) => { setRowsPerPage(Number(v)); setCurrentPage(1); }}>
                      <SelectTrigger className="w-18 h-8">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent align="start">
                        <SelectGroup>
                          <SelectItem value="10">10</SelectItem>
                          <SelectItem value="25">25</SelectItem>
                          <SelectItem value="50">50</SelectItem>
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                    <span className="text-xs text-muted-foreground">
                      {Math.min((currentPage - 1) * rowsPerPage + 1, filteredConnections.length)}–{Math.min(currentPage * rowsPerPage, filteredConnections.length)} of {filteredConnections.length}
                    </span>
                  </div>
                  {totalPages > 1 && (
                    <Pagination className="mx-0 w-auto">
                      <PaginationContent>
                        <PaginationItem>
                          <PaginationPrevious
                            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                            className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                          />
                        </PaginationItem>
                        {paginationPages.map((page, i) =>
                          page === '...' ? (
                            <PaginationItem key={`ellipsis-${i}`}>
                              <PaginationEllipsis />
                            </PaginationItem>
                          ) : (
                            <PaginationItem key={page}>
                              <PaginationLink
                                isActive={currentPage === page}
                                onClick={() => setCurrentPage(page as number)}
                                className="cursor-pointer"
                              >
                                {page}
                              </PaginationLink>
                            </PaginationItem>
                          )
                        )}
                        <PaginationItem>
                          <PaginationNext
                            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                            className={currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                          />
                        </PaginationItem>
                      </PaginationContent>
                    </Pagination>
                  )}
                </div>
              )}
            </>
          ) : (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <Globe className="h-10 w-10 text-muted-foreground/40 mb-3" />
              <p className="text-sm text-muted-foreground">
                Connect your first service to start using AI-powered automation.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Start Guide */}
      {connections.length === 0 && (
        <Card className="bg-gradient-to-t from-primary/10 to-card border-primary/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-base text-primary">Quick Start</CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="space-y-2 text-sm text-muted-foreground">
              {[
                'Choose a service from the grid above',
                'Add your API credentials',
                'Copy the MCP endpoint URL and API key',
                'Configure your MCP client',
              ].map((step, i) => (
                <li key={i} className="flex items-start gap-2.5">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/20 text-primary text-xs font-medium">
                    {i + 1}
                  </span>
                  {step}
                </li>
              ))}
            </ol>
          </CardContent>
          <CardFooter>
            <Button size="sm" className="w-full" asChild>
              <Link to={plugins[0]?.sidebarItems[0]?.href || '/dashboard'}>
                Get Started
                <ArrowRight className="h-3.5 w-3.5 ml-1.5" />
              </Link>
            </Button>
          </CardFooter>
        </Card>
      )}
    </div>
  );
}
