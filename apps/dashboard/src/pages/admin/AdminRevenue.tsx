import { useEffect, useState } from 'react';
import { getAdminRevenueOverview, type PlanDist } from '../../lib/platform-api';
import { Loader2, DollarSign } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, Table, TableHeader, TableBody, TableRow, TableHead, TableCell, Separator } from '@node2flow/dashboard-core';



export default function AdminRevenue() {
  const [mrr, setMrr] = useState(0);
  const [distribution, setDistribution] = useState<PlanDist[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetch() {
      const res = await getAdminRevenueOverview();
      if (res.success && res.data) {
        setMrr(res.data.mrr);
        setDistribution(res.data.plan_distribution);
      }
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

  const totalUsers = distribution.reduce((sum, d) => sum + d.count, 0);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Revenue</h1>
        <p className="text-muted-foreground mt-1">Monthly recurring revenue and plan distribution</p>
      </div>
      <Separator />

      {/* MRR Card */}
      <Card className="bg-gradient-to-br from-green-500 to-green-700 text-white border-0">
        <CardContent className="p-6">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 p-3 rounded-lg">
              <DollarSign className="h-8 w-8" />
            </div>
            <div>
              <p className="text-green-100 text-sm">Monthly Recurring Revenue</p>
              <p className="text-4xl font-bold">${mrr.toFixed(2)}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Plan Distribution */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Plan Distribution</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-4">
            {distribution.map((d) => {
              const pct = totalUsers > 0 ? Math.round((d.count / totalUsers) * 100) : 0;
              const revenue = d.count * d.price_monthly;
              return (
                <div key={d.plan} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-foreground capitalize">{d.plan}</span>
                    <div className="text-sm text-muted-foreground">
                      <span className="font-medium text-foreground">{d.count}</span> users
                      {' '}({pct}%)
                      {' - '}
                      <span className="font-medium text-emerald-400">${revenue.toFixed(2)}/mo</span>
                    </div>
                  </div>
                  <div className="h-3 bg-border rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        d.plan === 'enterprise' ? 'bg-purple-500' :
                        d.plan === 'pro' ? 'bg-blue-500' :
                        'bg-gray-400'
                      }`}
                      style={{ width: `${Math.max(pct, 2)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Revenue per plan table */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Revenue Breakdown</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Plan</TableHead>
                <TableHead className="text-right">Price</TableHead>
                <TableHead className="text-right">Users</TableHead>
                <TableHead className="text-right">Revenue</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {distribution.map((d) => (
                <TableRow key={d.plan}>
                  <TableCell className="font-medium capitalize">{d.plan}</TableCell>
                  <TableCell className="text-right">${d.price_monthly}/mo</TableCell>
                  <TableCell className="text-right">{d.count}</TableCell>
                  <TableCell className="text-right font-medium text-emerald-400">${(d.count * d.price_monthly).toFixed(2)}</TableCell>
                </TableRow>
              ))}
              <TableRow className="font-medium">
                <TableCell>Total</TableCell>
                <TableCell></TableCell>
                <TableCell className="text-right">{totalUsers}</TableCell>
                <TableCell className="text-right text-emerald-400">${mrr.toFixed(2)}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
