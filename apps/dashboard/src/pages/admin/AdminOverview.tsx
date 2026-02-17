import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getAdminStats, type AdminStats } from '../../lib/platform-api';
import { Users, DollarSign, Activity, AlertTriangle, Loader2, ArrowRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@node2flow/dashboard-core';
import { AdminNav } from '../../components/admin-nav';


export default function AdminOverview() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetch() {
      const res = await getAdminStats();
      if (res.success && res.data) setStats(res.data);
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

  const cards = [
    { label: 'Total Users', value: stats?.total_users || 0, sub: `${stats?.active_users || 0} active`, icon: Users, color: 'blue', link: '/admin/users' },
    { label: 'MRR', value: `$${(stats?.mrr || 0).toFixed(2)}`, sub: 'Monthly recurring revenue', icon: DollarSign, color: 'green', link: '/admin/revenue' },
    { label: 'Requests Today', value: stats?.total_requests_today || 0, sub: 'API calls today', icon: Activity, color: 'purple', link: '/admin/analytics' },
    { label: 'Error Rate', value: `${stats?.error_rate_today || 0}%`, sub: 'Today\'s error rate', icon: AlertTriangle, color: stats?.error_rate_today && stats.error_rate_today > 10 ? 'red' : 'yellow', link: '/admin/health' },
  ];

  const colorMap: Record<string, { bg: string; icon: string }> = {
    blue: { bg: 'bg-primary/10', icon: 'text-primary' },
    green: { bg: 'bg-green-900/30', icon: 'text-green-400' },
    purple: { bg: 'bg-purple-900/30', icon: 'text-purple-400' },
    yellow: { bg: 'bg-amber-900/30', icon: 'text-amber-400' },
    red: { bg: 'bg-red-900/30', icon: 'text-red-400' },
  };

  return (
    <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6 px-4 lg:px-6">
      <AdminNav />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card) => {
          const colors = colorMap[card.color];
          const Icon = card.icon;
          return (
            <Link key={card.label} to={card.link} className="block">
              <Card className="bg-gradient-to-t from-primary/5 to-card shadow-sm hover:shadow-md transition-all">
                <CardHeader className="pb-2">
                  <CardDescription className="flex items-center gap-2">
                    <div className={`p-1.5 rounded-md ${colors.bg}`}>
                      <Icon className={`h-3.5 w-3.5 ${colors.icon}`} />
                    </div>
                    {card.label}
                  </CardDescription>
                  <CardTitle className="text-2xl font-semibold tabular-nums">{card.value}</CardTitle>
                </CardHeader>
                <CardFooter className="text-sm text-muted-foreground flex items-center justify-between pt-0">
                  <span className="flex items-center gap-1.5">
                    {card.sub}
                  </span>
                  <ArrowRight className="h-3.5 w-3.5 text-primary" />
                </CardFooter>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
