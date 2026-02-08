import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import type { Usage, PlatformStats } from '../lib/platform-api';
import { getUsage, getPlatformStats } from '../lib/platform-api';
import type { Connection } from '@node2flow/dashboard-core';
import { getConnections, Card, CardContent, CardHeader, CardTitle, Button, Alert, AlertDescription, Progress, Badge } from '@node2flow/dashboard-core';

import { useAuth } from '@node2flow/dashboard-core';
import { plugins } from '../plugins/registry';
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
} from 'lucide-react';






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

  // Count unique product types that have at least one connection
  const connectedServices = new Set(connections.map(c => c.product_type)).size;

  // Helper: find plugin for a connection's product_type
  const getPlugin = (productType: string) =>
    plugins.find(p => p.id === productType);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Welcome back! Here's an overview of your account.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Zap className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Current Plan</p>
                <p className="text-3xl font-bold text-foreground capitalize">{user?.plan}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-900/30 rounded-lg">
                <Layers className="h-5 w-5 text-emerald-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Services</p>
                <p className="text-3xl font-bold text-foreground">
                  {connectedServices}
                  <span className="text-lg font-normal text-muted-foreground">
                    /{plugins.length}
                  </span>
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Activity className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Requests This Month</p>
                <p className="text-3xl font-bold text-foreground">
                  {usage?.monthly?.used.toLocaleString() || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-900/30 rounded-lg">
                <TrendingUp className="h-5 w-5 text-purple-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Success Rate</p>
                <p className="text-3xl font-bold text-foreground">{usage?.success_rate || 100}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Services Status Grid */}
      <div>
        <h2 className="text-lg font-semibold text-foreground mb-3">Services</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {plugins.map((plugin) => {
            const pluginConns = connections.filter(c => c.product_type === plugin.id);
            const isConnected = pluginConns.length > 0;
            const connectionsHref = plugin.sidebarItems.find(i => i.name === 'Connections')?.href || '/dashboard';
            const PluginIcon = plugin.icon;
            return (
              <Link to={connectionsHref} key={plugin.id} className="block">
                <Card className={`transition-colors hover:border-primary/50 ${isConnected ? 'border-emerald-800/50' : ''}`}>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${isConnected ? 'bg-emerald-900/30' : 'bg-muted'}`}>
                        <PluginIcon className={`h-5 w-5 ${isConnected ? 'text-emerald-400' : 'text-muted-foreground'}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate text-foreground">{plugin.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {isConnected
                            ? `${pluginConns.length} connection${pluginConns.length > 1 ? 's' : ''}`
                            : 'Not connected'}
                        </p>
                      </div>
                      <div className={`w-2 h-2 rounded-full shrink-0 ${isConnected ? 'bg-emerald-400' : 'bg-muted-foreground/30'}`} />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Daily Rate Limit */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-lg">Daily Rate Limit</CardTitle>
          <span className="text-sm text-muted-foreground">
            Resets {usage?.reset_at ? new Date(usage.reset_at).toLocaleDateString() : 'tomorrow'}
          </span>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">
                {usage?.requests.used.toLocaleString()} used today
              </span>
              <span className="text-muted-foreground">
                {usage?.requests.remaining.toLocaleString()} remaining
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
            <p className="text-xs text-muted-foreground">
              {usagePercent}% of daily limit ({usage?.requests.limit.toLocaleString()}/day)
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Platform Statistics */}
      {platformStats && (
        <Card>
          <CardHeader className="flex flex-row items-center gap-2 pb-2">
            <Globe className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">Platform Statistics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-muted rounded-lg p-4">
                <div className="flex items-center gap-2 mb-1">
                  <Users className="h-4 w-4 text-blue-400" />
                  <span className="text-sm text-muted-foreground">Total Users</span>
                </div>
                <p className="text-2xl font-bold text-foreground">
                  {platformStats.total_users.toLocaleString()}
                </p>
              </div>
              <div className="bg-muted rounded-lg p-4">
                <div className="flex items-center gap-2 mb-1">
                  <Activity className="h-4 w-4 text-primary" />
                  <span className="text-sm text-muted-foreground">Total Executions</span>
                </div>
                <p className="text-2xl font-bold text-foreground">
                  {platformStats.total_executions.toLocaleString()}
                </p>
              </div>
              <div className="bg-muted rounded-lg p-4">
                <div className="flex items-center gap-2 mb-1">
                  <CheckCircle className="h-4 w-4 text-emerald-400" />
                  <span className="text-sm text-muted-foreground">Successful</span>
                </div>
                <p className="text-2xl font-bold text-foreground">
                  {platformStats.total_successes.toLocaleString()}
                </p>
              </div>
              <div className="bg-muted rounded-lg p-4">
                <div className="flex items-center gap-2 mb-1">
                  <TrendingUp className="h-4 w-4 text-purple-400" />
                  <span className="text-sm text-muted-foreground">Pass Rate</span>
                </div>
                <p className="text-2xl font-bold text-foreground">
                  {platformStats.pass_rate}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Your Connections */}
      {connections.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Your Connections</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {connections.map((conn) => {
                const plugin = getPlugin(conn.product_type);
                const ConnIcon = plugin?.icon;
                return (
                  <div
                    key={conn.id}
                    className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full ${conn.status === 'active' ? 'bg-emerald-400' : 'bg-muted-foreground'}`} />
                      {ConnIcon && <ConnIcon className="h-4 w-4 text-muted-foreground" />}
                      <div>
                        <p className="font-medium text-foreground">{conn.name}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="text-xs">
                        {plugin?.name || conn.product_type}
                      </Badge>
                      <Badge variant={conn.status === 'active' ? 'success' : 'secondary'}>
                        {conn.status}
                      </Badge>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Start Guide */}
      {connections.length === 0 && (
        <Card className="bg-primary/10 border-primary/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg text-primary">Quick Start Guide</CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="list-decimal list-inside space-y-2 text-primary">
              <li>Choose a service from the grid above</li>
              <li>Add your API credentials to create a connection</li>
              <li>Copy the MCP endpoint URL and API key</li>
              <li>Configure your MCP client (Claude Desktop, Cursor, etc.)</li>
            </ol>
            <Button className="mt-4" asChild>
              <Link to={plugins[0]?.sidebarItems.find(i => i.name === 'Connections')?.href || '/dashboard'}>
                Get Started
                <ArrowRight className="h-4 w-4 ml-2" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
