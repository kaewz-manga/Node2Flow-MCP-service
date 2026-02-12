import { useEffect, useState, useMemo } from 'react';
import {
  getAdminErrors,
  getAdminErrorTrend,
  type ErrorLog,
} from '../../lib/platform-api';
import { Loader2, AlertTriangle, Activity, TrendingDown, Clock, ShieldAlert } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter, Table, TableHeader, TableBody, TableRow, TableHead, TableCell, Separator, Badge } from '@node2flow/dashboard-core';



export default function AdminHealth() {
  const [errors, setErrors] = useState<ErrorLog[]>([]);
  const [trend, setTrend] = useState<{ date: string; count: number }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetch() {
      const [errRes, trendRes] = await Promise.all([
        getAdminErrors(50),
        getAdminErrorTrend(30),
      ]);
      if (errRes.success && errRes.data) setErrors(errRes.data.errors);
      if (trendRes.success && trendRes.data) setTrend(trendRes.data.trend);
      setLoading(false);
    }
    fetch();
  }, []);

  const maxErrors = Math.max(...trend.map(d => d.count), 1);
  const totalErrors = trend.reduce((sum, d) => sum + d.count, 0);

  // Compute additional stats (must be before early return to respect Rules of Hooks)
  const stats = useMemo(() => {
    const todayStr = new Date().toISOString().slice(0, 10);
    const todayErrors = trend.find(d => d.date === todayStr)?.count || 0;
    const avgPerDay = trend.length > 0 ? Math.round(totalErrors / trend.length) : 0;
    const uniqueTools = new Set(errors.map(e => e.tool_name)).size;
    const avgResponseTime = errors.length > 0
      ? Math.round(errors.reduce((sum, e) => sum + (e.response_time_ms || 0), 0) / errors.length)
      : 0;
    const isHealthy = totalErrors === 0;
    return { todayErrors, avgPerDay, uniqueTools, avgResponseTime, isHealthy };
  }, [errors, trend, totalErrors]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-foreground">System Health</h1>
        <p className="text-muted-foreground mt-1">Error trends and recent failures</p>
      </div>
      <Separator />

      {/* Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className={`bg-gradient-to-t shadow-sm ${stats.isHealthy ? 'from-primary/5 to-card' : 'from-red-500/5 to-card'}`}>
          <CardHeader className="pb-2">
            <CardDescription>30-Day Errors</CardDescription>
            <CardTitle className={`text-2xl font-semibold tabular-nums ${stats.isHealthy ? 'text-primary' : 'text-red-400'}`}>{totalErrors}</CardTitle>
          </CardHeader>
          <CardFooter className="text-sm text-muted-foreground">
            {stats.isHealthy ? (
              <><Activity className="h-3.5 w-3.5 mr-1.5 text-primary" />System healthy</>
            ) : (
              <><AlertTriangle className="h-3.5 w-3.5 mr-1.5 text-red-400" />Needs attention</>
            )}
          </CardFooter>
        </Card>

        <Card className="bg-gradient-to-t from-amber-500/5 to-card shadow-sm">
          <CardHeader className="pb-2">
            <CardDescription>Today</CardDescription>
            <CardTitle className="text-2xl font-semibold tabular-nums text-amber-400">{stats.todayErrors}</CardTitle>
          </CardHeader>
          <CardFooter className="text-sm text-muted-foreground">
            <Clock className="h-3.5 w-3.5 mr-1.5 text-amber-400" />
            Avg {stats.avgPerDay}/day
          </CardFooter>
        </Card>

        <Card className="bg-gradient-to-t from-purple-500/5 to-card shadow-sm">
          <CardHeader className="pb-2">
            <CardDescription>Affected Tools</CardDescription>
            <CardTitle className="text-2xl font-semibold tabular-nums text-purple-400">{stats.uniqueTools}</CardTitle>
          </CardHeader>
          <CardFooter className="text-sm text-muted-foreground">
            <ShieldAlert className="h-3.5 w-3.5 mr-1.5 text-purple-400" />
            Unique tools with errors
          </CardFooter>
        </Card>

        <Card className="bg-gradient-to-t from-primary/5 to-card shadow-sm">
          <CardHeader className="pb-2">
            <CardDescription>Avg Response</CardDescription>
            <CardTitle className="text-2xl font-semibold tabular-nums">{stats.avgResponseTime}ms</CardTitle>
          </CardHeader>
          <CardFooter className="text-sm text-muted-foreground">
            <TrendingDown className="h-3.5 w-3.5 mr-1.5 text-primary" />
            Failed requests
          </CardFooter>
        </Card>
      </div>

      {/* Error Trend */}
      <Card className="shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Error Trend (30 days)</CardTitle>
            {totalErrors > 0 && (
              <Badge variant="secondary" className="bg-red-500/10 text-red-400">
                {totalErrors} total
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          {trend.length === 0 ? (
            <div className="text-center py-8">
              <Activity className="h-10 w-10 text-primary mx-auto mb-3" />
              <p className="text-primary font-medium">All clear</p>
              <p className="text-muted-foreground text-sm mt-1">No errors in the last 30 days</p>
            </div>
          ) : (
            <div className="space-y-1">
              {trend.map((d) => {
                const intensity = d.count / maxErrors;
                return (
                  <div key={d.date} className="flex items-center gap-3 group">
                    <span className="text-xs text-muted-foreground w-20 shrink-0 font-mono">{d.date.slice(5)}</span>
                    <div className="flex-1">
                      <div
                        className={`h-4 rounded-sm transition-all group-hover:opacity-80 ${
                          intensity > 0.7 ? 'bg-red-500' :
                          intensity > 0.3 ? 'bg-amber-500' : 'bg-amber-400/60'
                        }`}
                        style={{ width: `${(d.count / maxErrors) * 100}%`, minWidth: '4px' }}
                      />
                    </div>
                    <span className="text-xs text-muted-foreground w-10 text-right font-mono">{d.count}</span>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Errors */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Recent Errors</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          {errors.length === 0 ? (
            <p className="text-muted-foreground text-sm py-4 text-center">No errors found</p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Time</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Tool</TableHead>
                    <TableHead>Error</TableHead>
                    <TableHead className="text-right">ms</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {errors.map((e) => (
                    <TableRow key={e.id}>
                      <TableCell className="text-xs whitespace-nowrap">
                        {new Date(e.created_at).toLocaleString()}
                      </TableCell>
                      <TableCell className="truncate max-w-[150px]">{e.email}</TableCell>
                      <TableCell className="font-mono">{e.tool_name}</TableCell>
                      <TableCell className="text-red-400 truncate max-w-[250px]" title={e.error_message}>
                        {e.error_message}
                      </TableCell>
                      <TableCell className="text-right">{e.response_time_ms}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
