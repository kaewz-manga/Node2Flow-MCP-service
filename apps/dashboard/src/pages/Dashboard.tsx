import { useCallback, useEffect, useMemo, useState } from 'react';
import type { Usage, UsageMonthlyHistory, UsageDailyHistory, ConnectionUsageStats } from '../lib/platform-api';
import { getUsage, getUserUsageHistory, getUserDailyUsage, getConnectionUsage } from '../lib/platform-api';
import type { Connection } from '@node2flow/dashboard-core';
import { getConnections } from '@node2flow/dashboard-core';

import { useAuth } from '@node2flow/dashboard-core';
import { plugins } from '../plugins/registry';
import { Loader2, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@node2flow/dashboard-core';
import { DashboardSectionCards } from '../components/section-cards';
import { DashboardUsageChart } from '../components/chart-area-interactive';
import { ConnectionsDataTable } from '../components/connections-table';

export default function Dashboard() {
  const { user } = useAuth();
  const [usage, setUsage] = useState<Usage | null>(null);
  const [connections, setConnections] = useState<Connection[]>([]);
  const [usageHistory, setUsageHistory] = useState<UsageMonthlyHistory[]>([]);
  const [dailyUsage, setDailyUsage] = useState<UsageDailyHistory[]>([]);
  const [connectionUsage, setConnectionUsage] = useState<ConnectionUsageStats[]>([]);
  const [connectionPeriod, setConnectionPeriod] = useState<7 | 30 | 90 | 180>(7);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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
        const [usageRes, connectionsRes, historyRes, dailyRes, connUsageRes] = await Promise.all([
          getUsage(),
          getConnections(),
          getUserUsageHistory(12),
          getUserDailyUsage(7),
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

        if (historyRes.success && historyRes.data) {
          setUsageHistory(historyRes.data.history);
        }

        if (dailyRes.success && dailyRes.data) {
          setDailyUsage(dailyRes.data.daily);
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

  const handlePeriodChange = useCallback(async (days: 7 | 30 | 90 | 180) => {
    setConnectionPeriod(days);
    const [connRes, dailyRes] = await Promise.all([
      getConnectionUsage(days),
      days <= 30 ? getUserDailyUsage(days) : Promise.resolve(null),
    ]);
    if (connRes.success && connRes.data) {
      setConnectionUsage(connRes.data.connections);
    }
    if (dailyRes && dailyRes.success && dailyRes.data) {
      setDailyUsage(dailyRes.data.daily);
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
    <div className="@container/main flex flex-1 flex-col gap-2">
      <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
        <div className="px-4 lg:px-6">
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
        </div>
        <div className="px-4 lg:px-6">
          <DashboardUsageChart
            monthlyData={usageHistory}
            dailyData={dailyUsage}
            connectionPeriod={connectionPeriod}
            onConnectionPeriodChange={handlePeriodChange}
          />
        </div>
        <ConnectionsDataTable
          connections={connections}
          usageStats={connectionUsage}
          pluginMap={pluginMap}
        />
      </div>
    </div>
  );
}
