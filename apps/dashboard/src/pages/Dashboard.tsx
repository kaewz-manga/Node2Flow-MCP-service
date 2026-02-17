import { useEffect, useState } from 'react';
import type { Usage, PlatformStats } from '../lib/platform-api';
import { getUsage, getPlatformStats } from '../lib/platform-api';
import type { Connection } from '@node2flow/dashboard-core';
import {
  getConnections,
  Card, CardContent,
  Alert, AlertDescription, Progress, Separator,
} from '@node2flow/dashboard-core';

import { useAuth } from '@node2flow/dashboard-core';
import { plugins } from '../plugins/registry';
import {
  Zap,
  Layers,
  Activity,
  TrendingUp,
  Loader2,
  AlertCircle,
  Users,
  CheckCircle,
  Gauge,
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

  const connectedServices = new Set(connections.map(c => c.product_type)).size;

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
    </div>
  );
}
