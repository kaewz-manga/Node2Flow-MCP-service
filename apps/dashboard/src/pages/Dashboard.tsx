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

      {/* Stat Cards — shadcn SectionCards pattern */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-t from-primary/5 to-card shadow-sm">
          <CardHeader className="pb-2">
            <CardDescription>Current Plan</CardDescription>
            <CardTitle className="text-2xl font-semibold tabular-nums capitalize">
              {user?.plan}
            </CardTitle>
          </CardHeader>
          <CardFooter className="text-sm text-muted-foreground">
            <Zap className="h-3.5 w-3.5 mr-1.5 text-primary" />
            {usage?.requests.limit.toLocaleString()} requests/day
          </CardFooter>
        </Card>

        <Card className="bg-gradient-to-t from-emerald-500/5 to-card shadow-sm">
          <CardHeader className="pb-2">
            <CardDescription>Connected Services</CardDescription>
            <CardTitle className="text-2xl font-semibold tabular-nums">
              {connectedServices}
              <span className="text-base font-normal text-muted-foreground ml-1">
                / {plugins.length}
              </span>
            </CardTitle>
          </CardHeader>
          <CardFooter className="text-sm text-muted-foreground">
            <Layers className="h-3.5 w-3.5 mr-1.5 text-emerald-500" />
            {plugins.length - connectedServices} services available
          </CardFooter>
        </Card>

        <Card className="bg-gradient-to-t from-primary/5 to-card shadow-sm">
          <CardHeader className="pb-2">
            <CardDescription>Requests This Month</CardDescription>
            <CardTitle className="text-2xl font-semibold tabular-nums">
              {usage?.monthly?.used.toLocaleString() || 0}
            </CardTitle>
          </CardHeader>
          <CardFooter className="text-sm text-muted-foreground">
            <Activity className="h-3.5 w-3.5 mr-1.5 text-primary" />
            {usage?.requests.used || 0} used today
          </CardFooter>
        </Card>

        <Card className="bg-gradient-to-t from-purple-500/5 to-card shadow-sm">
          <CardHeader className="pb-2">
            <CardDescription>Success Rate</CardDescription>
            <CardTitle className="text-2xl font-semibold tabular-nums">
              {usage?.success_rate || 100}%
            </CardTitle>
          </CardHeader>
          <CardFooter className="text-sm text-muted-foreground">
            <TrendingUp className="h-3.5 w-3.5 mr-1.5 text-purple-500" />
            All systems operational
          </CardFooter>
        </Card>
      </div>

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

      {/* Services Grid — Larger cards with tagline + tool count */}
      <div>
        <h2 className="text-lg font-semibold text-foreground mb-3">Services</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {plugins.map((plugin) => {
            const pluginConns = connections.filter(c => c.product_type === plugin.id);
            const isConnected = pluginConns.length > 0;
            const connectionsHref = plugin.sidebarItems.find(i => i.name === 'Connections')?.href || '/dashboard';
            const PluginIcon = plugin.icon;
            const toolCount = TOOL_COUNTS[plugin.id] || 0;

            return (
              <Card
                key={plugin.id}
                className={`transition-all hover:shadow-md ${
                  isConnected ? 'border-l-4 border-l-emerald-500' : ''
                }`}
              >
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className={`p-2 rounded-lg ${isConnected ? 'bg-emerald-900/30' : 'bg-muted'}`}>
                        <PluginIcon className={`h-4 w-4 ${isConnected ? 'text-emerald-400' : 'text-muted-foreground'}`} />
                      </div>
                      <CardTitle className="text-base">{plugin.name}</CardTitle>
                    </div>
                    {isConnected && (
                      <Badge variant="outline" className="text-emerald-400 border-emerald-800">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Connected
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="pb-3">
                  <p className="text-sm text-muted-foreground line-clamp-1">
                    {plugin.content.tagline}
                  </p>
                </CardContent>
                <CardFooter className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">
                    {toolCount} tools
                    {isConnected && ` · ${pluginConns.length} connection${pluginConns.length > 1 ? 's' : ''}`}
                  </span>
                  <Button variant="ghost" size="sm" asChild className="h-7 text-xs">
                    <Link to={connectionsHref}>
                      {isConnected ? 'Manage' : 'Connect'}
                      <ArrowRight className="h-3 w-3 ml-1" />
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Two-column layout: Connections + Rate Limit / Quick Start */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left: Connections Table */}
        <div className="lg:col-span-2">
          <Card>
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
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Service</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {connections.map((conn) => {
                        const plugin = getPlugin(conn.product_type);
                        const ConnIcon = plugin?.icon;
                        const connHref = plugin?.sidebarItems.find(i => i.name === 'Connections')?.href || '/dashboard';
                        return (
                          <TableRow key={conn.id}>
                            <TableCell className="font-medium">
                              <div className="flex items-center gap-2">
                                <div className={`w-2 h-2 rounded-full ${conn.status === 'active' ? 'bg-emerald-400' : 'bg-muted-foreground'}`} />
                                {conn.name}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                {ConnIcon && <ConnIcon className="h-3.5 w-3.5 text-muted-foreground" />}
                                <Badge variant="secondary" className="text-xs">
                                  {plugin?.name || conn.product_type}
                                </Badge>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant={conn.status === 'active' ? 'success' : 'secondary'}>
                                {conn.status}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <Button variant="ghost" size="sm" asChild className="h-7 text-xs">
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
        </div>

        {/* Right: Rate Limit + Quick Start */}
        <div className="space-y-4">
          {/* Daily Rate Limit */}
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  <Gauge className="h-4 w-4 text-primary" />
                  Daily Rate Limit
                </CardTitle>
                <span className="text-xs text-muted-foreground">
                  Resets {usage?.reset_at ? new Date(usage.reset_at).toLocaleDateString() : 'tomorrow'}
                </span>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
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
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>{usage?.requests.used.toLocaleString()} used</span>
                  <span>{usage?.requests.remaining.toLocaleString()} left</span>
                </div>
                <p className="text-xs text-muted-foreground text-center">
                  {usagePercent}% of {usage?.requests.limit.toLocaleString()}/day limit
                </p>
              </div>
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

          {/* MCP Endpoint Card (shown when has connections) */}
          {connections.length > 0 && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">MCP Endpoint</CardTitle>
              </CardHeader>
              <CardContent>
                <code className="block text-xs bg-muted px-3 py-2 rounded-md break-all">
                  https://mcp.node2flow.net/mcp
                </code>
                <p className="text-xs text-muted-foreground mt-2">
                  Use this URL with your API key in any MCP client.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
