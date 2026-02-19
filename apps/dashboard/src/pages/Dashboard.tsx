import { useCallback, useEffect, useMemo, useState } from 'react';
import type { Usage, UsageMonthlyHistory, UsageDailyHistory, ConnectionUsageStats, ClientUsageStats } from '../lib/platform-api';
import { getUsage, getUserUsageHistory, getUserDailyUsage, getConnectionUsage, getClientUsage } from '../lib/platform-api';
import type { Connection } from '@node2flow/dashboard-core';
import { getConnections } from '@node2flow/dashboard-core';

import { useAuth } from '@node2flow/dashboard-core';
import { plugins } from '../plugins/registry';
import { Loader2, AlertCircle, Monitor } from 'lucide-react';
import { Alert, AlertDescription, Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@node2flow/dashboard-core';
import { DashboardSectionCards } from '../components/section-cards';
import { DashboardUsageChart } from '../components/chart-area-interactive';
import { ConnectionsDataTable } from '../components/connections-table';

const DI = 'https://cdn.jsdelivr.net/gh/homarr-labs/dashboard-icons/svg';
const SI = 'https://cdn.simpleicons.org';

const CLIENT_ICONS: Record<string, string> = {
  'n8n': '/logos/n8n.svg',
  'claude': `${DI}/claude-ai.svg`,
  'chatgpt': `${DI}/chatgpt.svg`,
  'cursor': `${SI}/cursor/white`,
  'windsurf': `${SI}/windsurf/white`,
  'warp': `${SI}/warp/white`,
  'codex': `${DI}/codex.svg`,
  'gemini': `${DI}/google-gemini.svg`,
  'raycast': `${SI}/raycast/white`,
  'vscode': `${SI}/vscodium/white`,
  'hugging': `${DI}/hugging-face.svg`,
};

function getClientIcon(clientName: string): string | null {
  const lower = clientName.toLowerCase();
  for (const [key, icon] of Object.entries(CLIENT_ICONS)) {
    if (lower.includes(key)) return icon;
  }
  return null;
}

export default function Dashboard() {
  const { user } = useAuth();
  const [usage, setUsage] = useState<Usage | null>(null);
  const [connections, setConnections] = useState<Connection[]>([]);
  const [usageHistory, setUsageHistory] = useState<UsageMonthlyHistory[]>([]);
  const [dailyUsage, setDailyUsage] = useState<UsageDailyHistory[]>([]);
  const [connectionUsage, setConnectionUsage] = useState<ConnectionUsageStats[]>([]);
  const [clientUsage, setClientUsage] = useState<ClientUsageStats[]>([]);
  const [connectionPeriod, setConnectionPeriod] = useState<7 | 30 | 90 | 180>(7);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const pluginMap = useMemo(() => {
    const map = new Map<string, { name: string; logo?: string; href?: string }>();
    for (const p of plugins) {
      map.set(p.id, { name: p.name, logo: p.logo, href: p.sidebarItems[0]?.href });
    }
    return map;
  }, []);

  useEffect(() => {
    async function fetchData() {
      try {
        const [usageRes, connectionsRes, historyRes, dailyRes, connUsageRes, clientRes] = await Promise.all([
          getUsage(),
          getConnections(),
          getUserUsageHistory(12),
          getUserDailyUsage(7),
          getConnectionUsage(7),
          getClientUsage(30),
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

        if (clientRes.success && clientRes.data) {
          setClientUsage(clientRes.data.clients);
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
          <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground mt-1">Overview of your MCP platform usage and connections</p>
        </div>
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
        {/* Client Activity */}
        <div className="px-4 lg:px-6 space-y-3">
          <div className="flex items-center gap-2">
            <Monitor className="h-4 w-4 text-muted-foreground" />
            <h3 className="text-sm font-semibold">Client Activity</h3>
          </div>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Client</TableHead>
                  <TableHead className="text-right">Requests</TableHead>
                  <TableHead className="text-right">Success</TableHead>
                  <TableHead className="text-right">Errors</TableHead>
                  <TableHead className="text-right">Connections</TableHead>
                  <TableHead>Last Seen</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {clientUsage.length > 0 ? (
                  clientUsage.map((c) => {
                    const icon = getClientIcon(c.client_name);
                    return (
                      <TableRow key={c.client_name}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {icon ? (
                              <img src={icon} alt="" className="h-5 w-5 object-contain" />
                            ) : (
                              <Monitor className="h-4 w-4 text-muted-foreground" />
                            )}
                            <span className="font-medium">{c.client_name}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right tabular-nums">{c.total_requests.toLocaleString()}</TableCell>
                        <TableCell className="text-right tabular-nums text-green-500">{c.successes.toLocaleString()}</TableCell>
                        <TableCell className={`text-right tabular-nums ${c.errors > 0 ? 'text-red-500' : 'text-muted-foreground'}`}>{c.errors.toLocaleString()}</TableCell>
                        <TableCell className="text-right tabular-nums">{c.connections_used.toLocaleString()}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {c.last_seen_at ? new Date(c.last_seen_at).toLocaleDateString() : 'Never'}
                        </TableCell>
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                      No client activity yet.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </div>
  );
}
