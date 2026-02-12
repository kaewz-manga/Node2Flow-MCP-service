import { useEffect, useState } from 'react';
import { getAdminRevenueOverview, type PlanDist } from '../../lib/platform-api';
import { Loader2, DollarSign, Users, TrendingUp, CreditCard } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter, Table, TableHeader, TableBody, TableRow, TableHead, TableCell, Separator, Badge } from '@node2flow/dashboard-core';



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
  const paidUsers = distribution.filter(d => d.price_monthly > 0).reduce((sum, d) => sum + d.count, 0);
  const conversionRate = totalUsers > 0 ? Math.round((paidUsers / totalUsers) * 100) : 0;
  const avgRevenuePerUser = totalUsers > 0 ? mrr / totalUsers : 0;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Revenue</h1>
        <p className="text-muted-foreground mt-1">Monthly recurring revenue and plan distribution</p>
      </div>
      <Separator />

      {/* Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-t from-primary/10 to-card shadow-sm border-primary/20">
          <CardHeader className="pb-2">
            <CardDescription>Monthly Revenue</CardDescription>
            <CardTitle className="text-2xl font-semibold tabular-nums text-primary">${mrr.toFixed(2)}</CardTitle>
          </CardHeader>
          <CardFooter className="text-sm text-muted-foreground">
            <DollarSign className="h-3.5 w-3.5 mr-1.5 text-primary" />
            MRR
          </CardFooter>
        </Card>

        <Card className="bg-gradient-to-t from-primary/5 to-card shadow-sm">
          <CardHeader className="pb-2">
            <CardDescription>Total Users</CardDescription>
            <CardTitle className="text-2xl font-semibold tabular-nums">{totalUsers}</CardTitle>
          </CardHeader>
          <CardFooter className="text-sm text-muted-foreground">
            <Users className="h-3.5 w-3.5 mr-1.5 text-primary" />
            {paidUsers} paying
          </CardFooter>
        </Card>

        <Card className="bg-gradient-to-t from-purple-500/5 to-card shadow-sm">
          <CardHeader className="pb-2">
            <CardDescription>Conversion</CardDescription>
            <CardTitle className="text-2xl font-semibold tabular-nums text-purple-400">{conversionRate}%</CardTitle>
          </CardHeader>
          <CardFooter className="text-sm text-muted-foreground">
            <TrendingUp className="h-3.5 w-3.5 mr-1.5 text-purple-400" />
            Free to paid
          </CardFooter>
        </Card>

        <Card className="bg-gradient-to-t from-amber-500/5 to-card shadow-sm">
          <CardHeader className="pb-2">
            <CardDescription>ARPU</CardDescription>
            <CardTitle className="text-2xl font-semibold tabular-nums text-amber-400">${avgRevenuePerUser.toFixed(2)}</CardTitle>
          </CardHeader>
          <CardFooter className="text-sm text-muted-foreground">
            <CreditCard className="h-3.5 w-3.5 mr-1.5 text-amber-400" />
            Per user/month
          </CardFooter>
        </Card>
      </div>

      {/* Plan Distribution */}
      <Card className="shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Plan Distribution</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-5">
            {distribution.map((d) => {
              const pct = totalUsers > 0 ? Math.round((d.count / totalUsers) * 100) : 0;
              const revenue = d.count * d.price_monthly;
              return (
                <div key={d.plan} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className={`w-3 h-3 rounded-full ${
                        d.plan === 'enterprise' ? 'bg-purple-500' :
                        d.plan === 'pro' ? 'bg-blue-500' : 'bg-zinc-400'
                      }`} />
                      <span className="text-sm font-medium text-foreground capitalize">{d.plan}</span>
                      <Badge variant="secondary" className="text-xs">{d.count} users</Badge>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <span className="text-muted-foreground">{pct}%</span>
                      <span className="font-medium text-primary">${revenue.toFixed(2)}/mo</span>
                    </div>
                  </div>
                  <div className="h-2.5 bg-muted rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        d.plan === 'enterprise' ? 'bg-gradient-to-r from-purple-500 to-purple-400' :
                        d.plan === 'pro' ? 'bg-gradient-to-r from-blue-500 to-blue-400' :
                        'bg-gradient-to-r from-zinc-400 to-zinc-300'
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
                  <TableCell className="text-right font-medium text-primary">${(d.count * d.price_monthly).toFixed(2)}</TableCell>
                </TableRow>
              ))}
              <TableRow className="font-medium">
                <TableCell>Total</TableCell>
                <TableCell></TableCell>
                <TableCell className="text-right">{totalUsers}</TableCell>
                <TableCell className="text-right text-primary">${mrr.toFixed(2)}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
