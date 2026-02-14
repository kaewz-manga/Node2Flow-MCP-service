import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import type { Usage, PlatformStats } from '../lib/platform-api';
import { getUsage, getPlatformStats } from '../lib/platform-api';
import type { Connection } from '@node2flow/dashboard-core';
import {
  getConnections,
  Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter,
  Button, Alert, AlertDescription, Progress, Badge, Separator,
  Table, TableHeader, TableBody, TableHead, TableRow, TableCell,
} from '@node2flow/dashboard-core';

import { useAuth } from '@node2flow/dashboard-core';
import { plugins } from '../plugins/registry';
import type { AppPlugin } from '../plugins/registry';
import {
  Zap,
  Layers,
  Activity,
  TrendingUp,
  ArrowRight,
  Loader2,
  AlertCircle,
  Users,
  CheckCircle,
  Globe,
  Gauge,
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
};

// Brand logos — local for custom, CDN for standard
const SERVICE_LOGOS: Record<string, string> = {
  n8n: 'https://cdn.simpleicons.org/n8n/EA4B71',
  wordpress: 'https://cdn.simpleicons.org/wordpress/21759B',
  'cl-n8n-mcp': 'https://cdn.simpleicons.org/n8n/FF8C69',
  'gemini-rag': '/logos/gemini.png',
  line: '/logos/line.png',
  'line-official': '/logos/line.png',
  telegram: '/logos/telegram.svg',
  slack: '/logos/slack.png',
  notion: 'https://cdn.simpleicons.org/notion/FFFFFF',
  'notion-official': 'https://cdn.simpleicons.org/notion/FFFFFF',
  playwright: 'https://playwright.dev/img/playwright-logo.svg',
  'google-workspace': 'https://cdn.simpleicons.org/google/4285F4',
};

export default function Dashboard() {
  const { user } = useAuth();
  const [usage, setUsage] = useState<Usage | null>(null);
  const [connections, setConnections] = useState<Connection[]>([]);
  const [platformStats, setPlatformStats] = useState<PlatformStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchData() {
      try {
        const [usageRes, connectionsRes, statsRes] = await Promise.all([
          getUsage(),
          getConnections(),
          getPlatformStats(),
        ]);

        if (connectionsRes.success && connectionsRes.data) {
          setConnections(connectionsRes.data.connections);
        }

        if (usageRes.success && usageRes.data) {
          const connCount = connectionsRes.success && connectionsRes.data
            ? connectionsRes.data.connections.length : 0;
          setUsage({
            ...usageRes.data,
            connections: usageRes.data.connections || { used: connCount, limit: -1 },
          });
        }

        if (statsRes.success && statsRes.data) {
          setPlatformStats(statsRes.data);
        }
      } catch {
        setError('Failed to load dashboard data');
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

  const usagePercent = usage
    ? Math.round((usage.requests.used / usage.requests.limit) * 100)
    : 0;

  const connectedServices = new Set(connections.map(c => c.product_type)).size;

  const getPlugin = (productType: string): AppPlugin | undefined =>
    plugins.find(p => p.id === productType);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Welcome back! Here's an overview of your account.
        </p>
      </div>

      <Separator />

      {/* Plan + Rate Limit — Full Width */}
      <Card className="bg-gradient-to-br from-blue-500/15 via-card to-blue-400/10 shadow-lg border-blue-500/30">
        <CardContent className="pt-5 pb-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left: Plan Info */}
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="p-3.5 rounded-lg bg-blue-500/20 shadow-sm shadow-blue-500/20">
                  <Zap className="h-8 w-8 text-blue-400" />
                </div>
                <div>
                  <p className="text-base text-white/80 font-medium">Current Plan</p>
                  <p className="text-4xl font-bold capitalize text-white">{user?.plan}</p>
                </div>
              </div>
              <div className="flex items-center gap-5 text-base text-white">
                <span className="flex items-center gap-2">
                  <Layers className="h-5 w-5 text-green-400" />
                  {connectedServices}/{plugins.length} services
                </span>
                <span className="flex items-center gap-2">
                  <Activity className="h-5 w-5 text-blue-400" />
                  {usage?.monthly?.used.toLocaleString() || 0} this month
                </span>
                <span className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-purple-400" />
                  {usage?.success_rate || 100}% success
                </span>
              </div>
            </div>

            {/* Right: Rate Limit */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-base text-white font-medium">
                  <Gauge className="h-5 w-5 text-blue-400" />
                  Daily Rate Limit
                </span>
                <span className="text-sm text-white/70">
                  Resets {usage?.reset_at ? new Date(usage.reset_at).toLocaleDateString() : 'tomorrow'}
                </span>
              </div>
              <Progress
                value={usagePercent}
                indicatorClassName={
                  usagePercent >= 90
                    ? 'bg-red-500'
                    : usagePercent >= 70
                    ? 'bg-yellow-500'
                    : undefined
                }
              />
              <div className="flex justify-between text-sm text-white/80">
                <span>{usage?.requests.used.toLocaleString()} used</span>
                <span>{usagePercent}% of {usage?.requests.limit.toLocaleString()}/day</span>
                <span>{usage?.requests.remaining.toLocaleString()} left</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Platform Stats Strip */}
      {platformStats && (
        <div className="flex items-center justify-center gap-6 text-sm text-muted-foreground py-1">
          <span className="flex items-center gap-1.5">
            <Users className="h-3.5 w-3.5" />
            {platformStats.total_users.toLocaleString()} users
          </span>
          <Separator orientation="vertical" className="h-4" />
          <span className="flex items-center gap-1.5">
            <Activity className="h-3.5 w-3.5" />
            {platformStats.total_executions.toLocaleString()} executions
          </span>
          <Separator orientation="vertical" className="h-4" />
          <span className="flex items-center gap-1.5">
            <CheckCircle className="h-3.5 w-3.5" />
            {platformStats.pass_rate}% pass rate
          </span>
        </div>
      )}

      {/* Services Grid — Compact cards */}
      <div>
        <h2 className="text-lg font-semibold text-foreground mb-3">Services</h2>
        <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2">
          {plugins.map((plugin) => {
            const pluginConns = connections.filter(c => c.product_type === plugin.id);
            const isConnected = pluginConns.length > 0;
            const connectionsHref = plugin.sidebarItems.find(i => i.name === 'Connections')?.href || '/dashboard';
            const PluginIcon = plugin.icon;
            const toolCount = TOOL_COUNTS[plugin.id] || 0;

            const logoUrl = SERVICE_LOGOS[plugin.id];

            return (
              <Link
                key={plugin.id}
                to={connectionsHref}
                className="block rounded-md border border-border/60 bg-card p-2.5 transition-all hover:shadow-md hover:border-primary/40"
              >
                <div className="flex flex-col items-center text-center gap-1.5">
                  {logoUrl ? (
                    <img src={logoUrl} alt={plugin.name} className="h-8 w-8 shrink-0" />
                  ) : (
                    <PluginIcon className="h-8 w-8 shrink-0 text-muted-foreground" />
                  )}
                  <span className="text-xs font-medium truncate w-full">{plugin.name}</span>
                  <Badge variant="outline" className="text-[10px]">{toolCount} tools</Badge>
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
                    <TableHead className="w-[1%] whitespace-nowrap text-center">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {connections.map((conn) => {
                    const plugin = getPlugin(conn.product_type);
                    const ConnIcon = plugin?.icon;
                    const connHref = plugin?.sidebarItems.find(i => i.name === 'Connections')?.href || '/dashboard';
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
              <Link to={plugins[0]?.sidebarItems.find(i => i.name === 'Connections')?.href || '/dashboard'}>
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
