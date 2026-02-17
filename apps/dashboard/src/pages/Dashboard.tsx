import { useCallback, useEffect, useMemo, useState } from 'react';
import type { Usage, PlatformStats, UsageMonthlyHistory, ConnectionUsageStats } from '../lib/platform-api';
import { getUsage, getPlatformStats, getUserUsageHistory, getConnectionUsage } from '../lib/platform-api';
import type { Connection } from '@node2flow/dashboard-core';
import {
  getConnections,
  Separator,
} from '@node2flow/dashboard-core';

import { useAuth } from '@node2flow/dashboard-core';
import { plugins } from '../plugins/registry';
import {
  Loader2,
  AlertCircle,
  Users,
  Activity,
  CheckCircle,
} from 'lucide-react';
import { Alert, AlertDescription } from '@node2flow/dashboard-core';
import { DashboardSectionCards } from '../components/section-cards';
import { DashboardUsageChart } from '../components/chart-area-interactive';
import { ConnectionsDataTable } from '../components/connections-table';

export default function Dashboard() {
  const { user } = useAuth();
  const [usage, setUsage] = useState<Usage | null>(null);
  const [connections, setConnections] = useState<Connection[]>([]);
  const [platformStats, setPlatformStats] = useState<PlatformStats | null>(null);
  const [usageHistory, setUsageHistory] = useState<UsageMonthlyHistory[]>([]);
  const [connectionUsage, setConnectionUsage] = useState<ConnectionUsageStats[]>([]);
  const [connectionPeriod, setConnectionPeriod] = useState<7 | 30 | 90>(7);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Build pluginMap once: product_type → { name, logo }
  const pluginMap = useMemo(() => {
    const map = new Map<string, { name: string; logo?: string }>();
    for (const p of plugins) {
      map.set(p.id, { name: p.name, logo: p.logo });
    }
    return map;
  }, []);

  useEffect(() => {
    async function fetchData() {
      try {
        const [usageRes, connectionsRes, statsRes, historyRes, connUsageRes] = await Promise.all([
          getUsage(),
          getConnections(),
          getPlatformStats(),
          getUserUsageHistory(12),
          getConnectionUsage(7),
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

        if (historyRes.success && historyRes.data) {
          setUsageHistory(historyRes.data.history);
        }

        if (connUsageRes.success && connUsageRes.data) {
          setConnectionUsage(connUsageRes.data.connections);
        }
      } catch {
        setError('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  // Re-fetch connection usage when period changes
  const handlePeriodChange = useCallback(async (days: 7 | 30 | 90) => {
    setConnectionPeriod(days);
    const res = await getConnectionUsage(days);
    if (res.success && res.data) {
      setConnectionUsage(res.data.connections);
    }
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
    <div className="@container/main flex flex-col gap-4 py-4 md:gap-6 md:py-6">
      {/* Section Cards */}
      <DashboardSectionCards
        plan={user?.plan || 'free'}
        dailyUsed={usage?.requests.used || 0}
        dailyLimit={usage?.requests.limit || 100}
        connectedServices={connectedServices}
        totalServices={plugins.length}
        monthlyRequests={usage?.monthly?.used || 0}
        successRate={usage?.success_rate || 100}
        monthlyErrors={usage?.monthly?.error_count || 0}
        resetAt={usage?.reset_at || ''}
      />

      {/* Usage Chart */}
      <div className="px-4 lg:px-6">
        <DashboardUsageChart data={usageHistory} />
      </div>

      {/* Connection Usage Data Table */}
      <ConnectionsDataTable
        connections={connections}
        usageStats={connectionUsage}
        pluginMap={pluginMap}
        period={connectionPeriod}
        onPeriodChange={handlePeriodChange}
      />

      {/* Platform Stats Strip */}
      {platformStats && (
        <div className="flex items-center justify-center gap-6 text-sm text-muted-foreground px-4 lg:px-6">
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
