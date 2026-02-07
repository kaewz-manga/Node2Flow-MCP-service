import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import type { Usage, PlatformStats } from '../lib/platform-api';
import { getUsage, getPlatformStats } from '../lib/platform-api';
import type { Connection } from '@node2flow/dashboard-core';
import { getConnections } from '@node2flow/dashboard-core';
import { useAuth } from '@node2flow/dashboard-core';
import { plugins } from '../plugins/registry';
import {
  Zap,
  Link as LinkIcon,
  Activity,
  TrendingUp,
  ArrowRight,
  Loader2,
  AlertCircle,
  Users,
  CheckCircle,
  Globe,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';

export default function Dashboard() {
  const { user } = useAuth();
  const [usage, setUsage] = useState<Usage | null>(null);
  const [connections, setConnections] = useState<Connection[]>([]);
  const [platformStats, setPlatformStats] = useState<PlatformStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const connectionsHref = plugins[0]?.sidebarItems.find(i => i.name === 'Connections')?.href || '/dashboard';

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
                <LinkIcon className="h-5 w-5 text-emerald-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Connections</p>
                <p className="text-3xl font-bold text-foreground">
                  {usage?.connections.used || 0}
                  <span className="text-lg font-normal text-muted-foreground">
                    /{usage?.connections.limit === -1 ? '\u221e' : (usage?.connections.limit || 1)}
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

      {/* Connections List */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-lg">Your Connections</CardTitle>
          <Link
            to={connectionsHref}
            className="text-sm text-primary hover:text-primary/80 flex items-center gap-1"
          >
            View all
            <ArrowRight className="h-4 w-4" />
          </Link>
        </CardHeader>
        <CardContent>
          {connections.length === 0 ? (
            <div className="text-center py-8">
              <LinkIcon className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground mb-4">No connections yet</p>
              <Button asChild>
                <Link to={connectionsHref}>
                  {plugins[0]?.content.emptyConnectionCTA || 'Add your first connection'}
                </Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {connections.slice(0, 3).map((conn) => (
                <div
                  key={conn.id}
                  className="flex items-center justify-between p-3 bg-card rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-2 h-2 rounded-full ${
                        conn.status === 'active' ? 'bg-emerald-400' : 'bg-muted-foreground'
                      }`}
                    />
                    <div>
                      <p className="font-medium text-foreground">{conn.name}</p>
                      <p className="text-sm text-muted-foreground">{conn.product_type}</p>
                    </div>
                  </div>
                  <Badge variant={conn.status === 'active' ? 'success' : 'secondary'}>
                    {conn.status}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Start Guide */}
      {connections.length === 0 && (
        <Card className="bg-primary/10 border-primary/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg text-primary">Quick Start Guide</CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="list-decimal list-inside space-y-2 text-primary">
              {(plugins[0]?.content.quickStartSteps || []).map((step, i) => (
                <li key={i}>{step}</li>
              ))}
            </ol>
            <Button className="mt-4" asChild>
              <Link to={connectionsHref}>
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
