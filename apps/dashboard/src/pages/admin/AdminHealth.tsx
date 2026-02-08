import { useEffect, useState } from 'react';
import {
  getAdminErrors,
  getAdminErrorTrend,
  type ErrorLog,
} from '../../lib/platform-api';
import { Loader2, AlertTriangle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';

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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const maxErrors = Math.max(...trend.map(d => d.count), 1);
  const totalErrors = trend.reduce((sum, d) => sum + d.count, 0);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-foreground">System Health</h1>
        <p className="text-muted-foreground mt-1">Error trends and recent failures</p>
      </div>

      {/* Summary */}
      <Card className="bg-gradient-to-br from-red-900/30 to-red-900/30 border-red-700">
        <CardContent className="p-6">
          <div className="flex items-center gap-3">
            <AlertTriangle className="h-6 w-6 text-red-500" />
            <div>
              <p className="font-medium text-red-300">{totalErrors} errors in last 30 days</p>
              <p className="text-sm text-red-400">{errors.length} most recent shown below</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Error Trend */}
      <Card>
        <CardContent className="p-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">Error Trend (30 days)</h2>
          {trend.length === 0 ? (
            <p className="text-muted-foreground text-sm py-4 text-center">No errors - system is healthy</p>
          ) : (
            <div className="space-y-1">
              {trend.map((d) => (
                <div key={d.date} className="flex items-center gap-3">
                  <span className="text-xs text-muted-foreground w-20 shrink-0">{d.date.slice(5)}</span>
                  <div className="flex-1">
                    <div
                      className="h-4 bg-red-400 rounded-sm"
                      style={{ width: `${(d.count / maxErrors) * 100}%`, minWidth: '4px' }}
                    />
                  </div>
                  <span className="text-xs text-muted-foreground w-10 text-right">{d.count}</span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Errors */}
      <Card>
        <CardContent className="p-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">Recent Errors</h2>
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
