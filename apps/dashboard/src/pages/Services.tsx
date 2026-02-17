import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import type { Connection } from '@node2flow/dashboard-core';
import {
  getConnections,
  Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter,
  Button, Alert, AlertDescription, Badge, Separator,
  Table, TableHeader, TableBody, TableHead, TableRow, TableCell,
} from '@node2flow/dashboard-core';

import { plugins } from '../plugins/registry';
import type { AppPlugin } from '../plugins/registry';
import {
  ArrowRight,
  Loader2,
  AlertCircle,
  Globe,
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

  const getPlugin = (productType: string): AppPlugin | undefined =>
    plugins.find(p => p.id === productType);

  return (
    <div className="space-y-6">
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
            const toolCount = TOOL_COUNTS[plugin.id] || 0;

            const logoUrl = SERVICE_LOGOS[plugin.id];

            return (
              <Link
                key={plugin.id}
                to={connectionsHref}
                className={`block rounded-md border bg-card p-2 transition-all hover:shadow-md hover:border-primary/40 ${isConnected ? 'border-l-[3px] border-l-emerald-500' : 'border-border/60'}`}
              >
                <div className="flex items-center gap-2 mb-1">
                  {logoUrl ? (
                    <img src={logoUrl} alt={plugin.name} className="h-5 w-5 shrink-0" />
                  ) : (
                    <PluginIcon className={`h-5 w-5 shrink-0 ${isConnected ? 'text-emerald-400' : 'text-muted-foreground'}`} />
                  )}
                  <span className="text-xs font-medium truncate">{plugin.name}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-muted-foreground">{toolCount} tools</span>
                  {isConnected && (
                    <div className="w-2 h-2 rounded-full bg-emerald-400" />
                  )}
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
            <div className="rounded-md border border-border/60">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[1%] text-center">Status</TableHead>
                    <TableHead className="w-[40%] text-center">Name</TableHead>
                    <TableHead className="text-center">Service</TableHead>
                    <TableHead className="w-[1%] whitespace-nowrap text-center"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {connections.map((conn) => {
                    const plugin = getPlugin(conn.product_type);
                    const ConnIcon = plugin?.icon;
                    const connHref = plugin?.sidebarItems[0]?.href || '/dashboard';
                    return (
                      <TableRow key={conn.id}>
                        <TableCell className="text-center">
                          <div className={`w-2.5 h-2.5 rounded-full mx-auto ${conn.status === 'active' ? 'bg-green-400' : 'bg-muted-foreground'}`} />
                        </TableCell>
                        <TableCell className="font-medium text-center">
                          {conn.name}
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="flex items-center justify-center gap-2">
                            {SERVICE_LOGOS[conn.product_type] ? (
                              <img src={SERVICE_LOGOS[conn.product_type]} alt="" className="h-3.5 w-3.5" />
                            ) : (
                              ConnIcon && <ConnIcon className="h-3.5 w-3.5 text-muted-foreground" />
                            )}
                            <Badge variant="secondary" className="text-xs">
                              {plugin?.name || conn.product_type}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <Button variant="outline" size="sm" asChild className="h-7 text-xs">
                            <Link to={connHref}>
                              Manage
                              <ArrowRight className="h-3 w-3 ml-1" />
                            </Link>
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
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
