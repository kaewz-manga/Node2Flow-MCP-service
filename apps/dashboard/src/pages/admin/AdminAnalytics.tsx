import { useEffect, useState } from 'react';
import {
  getAdminUsageTimeseries,
  getAdminTopTools,
  getAdminTopUsers,
  getAdminUsageByProduct,
  type UsageTimeseries,
  type TopTool,
  type TopUser,
  type ProductUsage,
} from '../../lib/platform-api';
import { Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, Table, TableHeader, TableBody, TableRow, TableHead, TableCell, Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@node2flow/dashboard-core';
import { AdminNav } from '../../components/admin-nav';



const PRODUCT_LABELS: Record<string, string> = {
  'n8n': 'n8n',
  'wordpress': 'WordPress',
  'cl-n8n-mcp': 'Workflow Builder',
  'other': 'Other',
};

const PRODUCT_COLORS: Record<string, string> = {
  'n8n': 'bg-orange-500',
  'wordpress': 'bg-blue-500',
  'cl-n8n-mcp': 'bg-purple-500',
  'other': 'bg-gray-500',
};

export default function AdminAnalytics() {
  const [timeseries, setTimeseries] = useState<UsageTimeseries[]>([]);
  const [tools, setTools] = useState<TopTool[]>([]);
  const [topUsers, setTopUsers] = useState<TopUser[]>([]);
  const [productUsage, setProductUsage] = useState<ProductUsage[]>([]);
  const [loading, setLoading] = useState(true);
  const [days, setDays] = useState(30);
  const [productFilter, setProductFilter] = useState('');

  useEffect(() => {
    async function fetch() {
      setLoading(true);
      const [tsRes, toolsRes, usersRes, productRes] = await Promise.all([
        getAdminUsageTimeseries(days),
        getAdminTopTools(days, productFilter || undefined),
        getAdminTopUsers(days),
        getAdminUsageByProduct(days),
      ]);
      if (tsRes.success && tsRes.data) setTimeseries(tsRes.data.timeseries);
      if (toolsRes.success && toolsRes.data) setTools(toolsRes.data.tools);
      if (usersRes.success && usersRes.data) setTopUsers(usersRes.data.users);
      if (productRes.success && productRes.data) setProductUsage(productRes.data.products);
      setLoading(false);
    }
    fetch();
  }, [days, productFilter]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const maxRequests = Math.max(...timeseries.map(d => d.requests), 1);
  const maxProductRequests = Math.max(...productUsage.map(p => p.requests), 1);
  const totalProductRequests = productUsage.reduce((sum, p) => sum + p.requests, 0);

  return (
    <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
      <AdminNav />
      <div className="flex items-center justify-end">
        <Select value={String(days)} onValueChange={(value) => setDays(Number(value))}>
          <SelectTrigger className="w-[160px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7">Last 7 days</SelectItem>
            <SelectItem value="30">Last 30 days</SelectItem>
            <SelectItem value="90">Last 90 days</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Usage by Product */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Usage by Product</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          {productUsage.length === 0 ? (
            <p className="text-muted-foreground text-sm py-4 text-center">No data yet</p>
          ) : (
            <div className="space-y-3">
              {productUsage.map((p) => (
                <div key={p.product} className="flex items-center gap-3">
                  <span className="text-sm text-foreground w-32 shrink-0 font-medium">
                    {PRODUCT_LABELS[p.product] || p.product}
                  </span>
                  <div className="flex-1 flex items-center gap-1">
                    <div
                      className={`h-6 ${PRODUCT_COLORS[p.product] || 'bg-gray-500'} rounded-sm`}
                      style={{ width: `${(p.requests / maxProductRequests) * 100}%`, minWidth: p.requests > 0 ? '4px' : '0' }}
                    />
                    {p.errors > 0 && (
                      <div
                        className="h-6 bg-red-400 rounded-sm"
                        style={{ width: `${(p.errors / maxProductRequests) * 100}%`, minWidth: '4px' }}
                      />
                    )}
                  </div>
                  <div className="text-right shrink-0 w-40">
                    <span className="text-sm text-foreground font-medium">{p.requests}</span>
                    <span className="text-xs text-muted-foreground ml-1">
                      ({totalProductRequests > 0 ? Math.round((p.requests / totalProductRequests) * 100) : 0}%)
                    </span>
                    {p.errors > 0 && (
                      <span className="text-xs text-red-400 ml-2">{p.errors} err</span>
                    )}
                    <span className="text-xs text-muted-foreground ml-2">{p.avg_response_ms}ms</span>
                  </div>
                </div>
              ))}
              <div className="flex gap-4 mt-2 text-xs text-muted-foreground">
                {productUsage.map((p) => (
                  <span key={p.product} className="flex items-center gap-1">
                    <span className={`w-3 h-3 ${PRODUCT_COLORS[p.product] || 'bg-gray-500'} rounded-sm`} />
                    {PRODUCT_LABELS[p.product] || p.product}
                  </span>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Requests Chart */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Requests Over Time</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          {timeseries.length === 0 ? (
            <p className="text-muted-foreground text-sm py-8 text-center">No data yet</p>
          ) : (
            <div className="space-y-2">
              {timeseries.map((d) => (
                <div key={d.date} className="flex items-center gap-3">
                  <span className="text-xs text-muted-foreground w-20 shrink-0">{d.date.slice(5)}</span>
                  <div className="flex-1 flex items-center gap-1">
                    <div
                      className="h-5 bg-blue-500 rounded-sm"
                      style={{ width: `${(d.requests / maxRequests) * 100}%`, minWidth: d.requests > 0 ? '4px' : '0' }}
                    />
                    {d.errors > 0 && (
                      <div
                        className="h-5 bg-red-400 rounded-sm"
                        style={{ width: `${(d.errors / maxRequests) * 100}%`, minWidth: '4px' }}
                      />
                    )}
                  </div>
                  <span className="text-xs text-muted-foreground w-16 text-right">{d.requests}</span>
                </div>
              ))}
              <div className="flex gap-4 mt-2 text-xs text-muted-foreground">
                <span className="flex items-center gap-1"><span className="w-3 h-3 bg-blue-500 rounded-sm" /> Requests</span>
                <span className="flex items-center gap-1"><span className="w-3 h-3 bg-red-400 rounded-sm" /> Errors</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Tools */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Top Tools</CardTitle>
              <Select value={productFilter || 'all'} onValueChange={(value) => setProductFilter(value === 'all' ? '' : value)}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="All Products" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Products</SelectItem>
                  <SelectItem value="n8n">n8n</SelectItem>
                  <SelectItem value="wordpress">WordPress</SelectItem>
                  <SelectItem value="cl-n8n-mcp">Workflow Builder</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            {tools.length === 0 ? (
              <p className="text-muted-foreground text-sm py-4 text-center">No data yet</p>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Tool</TableHead>
                      <TableHead className="text-right">Calls</TableHead>
                      <TableHead className="text-right">Errors</TableHead>
                      <TableHead className="text-right">Avg ms</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {tools.map((t) => (
                      <TableRow key={t.tool_name}>
                        <TableCell className="font-mono">{t.tool_name}</TableCell>
                        <TableCell className="text-right">{t.count}</TableCell>
                        <TableCell className="text-right">
                          <span className={t.error_count > 0 ? 'text-red-400' : 'text-muted-foreground'}>{t.error_count}</span>
                        </TableCell>
                        <TableCell className="text-right">{Math.round(t.avg_response_ms)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Top Users */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Top Users</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            {topUsers.length === 0 ? (
              <p className="text-muted-foreground text-sm py-4 text-center">No data yet</p>
            ) : (
              <div className="space-y-3">
                {topUsers.map((u, i) => (
                  <div key={u.user_id} className="flex items-center gap-3">
                    <span className="text-sm font-medium text-muted-foreground w-6">{i + 1}.</span>
                    <span className="text-sm text-foreground flex-1 truncate">{u.email}</span>
                    <span className="text-sm font-medium text-muted-foreground">{u.request_count} calls</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
