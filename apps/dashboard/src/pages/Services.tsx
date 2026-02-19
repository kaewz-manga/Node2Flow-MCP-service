import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import type { Connection } from '@node2flow/dashboard-core';
import {
  getConnections,
  Card, CardContent, CardHeader, CardTitle, CardFooter,
  Button, Alert, AlertDescription, Badge,
} from '@node2flow/dashboard-core';

import { plugins } from '../plugins/registry';
import {
  ArrowRight,
  Loader2,
  AlertCircle,
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

  return (
    <div className="space-y-6 overflow-x-hidden px-4 lg:px-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Services</h1>
        <p className="text-muted-foreground mt-1">
          {connectedServices}/{plugins.length} services connected — {plugins.reduce((sum, p) => sum + (TOOL_COUNTS[p.id] || 0), 0)} tools available
        </p>
      </div>

      {/* Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {plugins.map((plugin) => {
          const pluginConns = connections.filter(c => c.product_type === plugin.id);
          const isConnected = pluginConns.length > 0;
          const connectionsHref = plugin.sidebarItems[0]?.href || `/${plugin.id}`;
          const PluginIcon = plugin.icon;
          const logoUrl = SERVICE_LOGOS[plugin.id];
          const toolCount = TOOL_COUNTS[plugin.id];

          return (
            <Link
              key={plugin.id}
              to={connectionsHref}
              className={`block rounded-lg border bg-card p-4 transition-all hover:shadow-md hover:border-primary/40 ${isConnected ? 'border-l-[3px] border-l-emerald-500' : 'border-border'}`}
            >
              <div className="flex flex-col gap-3">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted">
                    {logoUrl ? (
                      <img src={logoUrl} alt="" className="h-7 w-7 object-contain" />
                    ) : (
                      <PluginIcon className="h-5 w-5 text-muted-foreground" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-sm">{plugin.name}</span>
                      {isConnected && (
                        <Badge variant="default" className="bg-emerald-600 hover:bg-emerald-600 text-[10px] px-1.5 py-0">Connected</Badge>
                      )}
                      {toolCount && (
                        <Badge variant="outline" className="text-[10px] px-1.5 py-0">{toolCount} tools</Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{plugin.content.tagline}</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <span className={`inline-flex items-center gap-1.5 text-xs font-medium ${isConnected ? 'text-emerald-400' : 'text-muted-foreground'}`}>
                    {isConnected ? 'Manage' : 'Connect'}
                    <ArrowRight className="h-3 w-3" />
                  </span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>

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
