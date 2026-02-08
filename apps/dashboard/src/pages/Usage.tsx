import { useEffect, useState } from 'react';
import type { Usage as UsageType, Plan } from '../lib/platform-api';
import { getUsage, getPlans, createCheckoutSession } from '../lib/platform-api';
import { useAuth } from '@node2flow/dashboard-core';
import {
  Activity,
  TrendingUp,
  Calendar,
  Zap,
  Loader2,
  AlertCircle,
  ArrowUpRight,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';

export default function Usage() {
  const { user } = useAuth();
  const [usage, setUsage] = useState<UsageType | null>(null);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [checkoutLoading, setCheckoutLoading] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const [usageRes, plansRes] = await Promise.all([getUsage(), getPlans()]);
        if (usageRes.success && usageRes.data) setUsage(usageRes.data);
        if (plansRes.success && plansRes.data) setPlans(plansRes.data.plans);
      } catch { setError('Failed to load usage data'); }
      finally { setLoading(false); }
    }
    fetchData();
  }, []);

  if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

  if (error) return <Alert variant="destructive"><AlertCircle className="h-5 w-5" /><AlertDescription>{error}</AlertDescription></Alert>;

  const isUnlimited = usage?.requests.unlimited || usage?.requests.limit === -1;
  const usagePercent = usage && !isUnlimited ? Math.round((usage.requests.used / usage.requests.limit) * 100) : 0;
  const currentPlan = plans.find((p) => p.id === user?.plan);
  const dailyLimit = currentPlan?.daily_request_limit ?? 100;
  const minuteLimit = currentPlan?.requests_per_minute ?? 50;

  async function handleChangePlan(planId: string) {
    setCheckoutLoading(planId);
    try {
      const res = await createCheckoutSession(planId);
      if (res.success && res.data?.url) window.location.href = res.data.url;
      else setError(res.error?.message || 'Failed to create checkout session');
    } catch { setError('Failed to connect to billing service'); }
    finally { setCheckoutLoading(null); }
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Usage & Billing</h1>
        <p className="text-muted-foreground mt-1">Monitor your API usage and manage your subscription</p>
      </div>

      {/* Current Plan Card */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-muted-foreground text-sm">Current Plan</p>
              <h2 className="text-3xl font-bold capitalize mt-1 text-foreground">{currentPlan?.name || user?.plan}</h2>
              <p className="text-muted-foreground mt-2">
                {minuteLimit === -1 ? 'Unlimited' : minuteLimit} req/min
                {' \u2022 '}
                {dailyLimit === -1 ? <span className="font-semibold text-emerald-400">Unlimited/day</span> : `${dailyLimit.toLocaleString()} req/day`}
                {' \u2022 '} Unlimited instances
              </p>
            </div>
            <div className="text-right">
              {currentPlan?.price_monthly === -1 ? (
                <p className="text-2xl font-bold text-foreground">Custom</p>
              ) : (
                <p className="text-4xl font-bold text-primary">
                  ${currentPlan?.price_monthly || 0}
                  <span className="text-lg font-normal text-muted-foreground">/mo</span>
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Usage Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-primary/10 rounded-lg"><Activity className="h-5 w-5 text-primary" /></div>
              <span className="text-sm font-medium text-muted-foreground">Requests Today</span>
            </div>
            {isUnlimited ? (
              <>
                <p className="text-3xl font-bold text-foreground">
                  {usage?.requests.used.toLocaleString()}
                  <span className="text-lg font-normal text-emerald-400 ml-2">Unlimited</span>
                </p>
                <Progress value={100} indicatorClassName="bg-emerald-400" className="mt-3" />
              </>
            ) : (
              <>
                <p className="text-3xl font-bold text-foreground">
                  {usage?.requests.used.toLocaleString()}
                  <span className="text-lg font-normal text-muted-foreground">/{usage?.requests.limit.toLocaleString()}</span>
                </p>
                <Progress
                  value={usagePercent}
                  indicatorClassName={usagePercent >= 90 ? 'bg-red-400' : usagePercent >= 70 ? 'bg-amber-400' : undefined}
                  className="mt-3"
                />
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-emerald-900/30 rounded-lg"><TrendingUp className="h-5 w-5 text-emerald-400" /></div>
              <span className="text-sm font-medium text-muted-foreground">Success Rate</span>
            </div>
            <p className="text-3xl font-bold text-foreground">{usage?.success_rate || 100}%</p>
            <p className="text-sm text-muted-foreground mt-1">This month: {usage?.monthly?.used.toLocaleString() || 0} requests</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-purple-900/30 rounded-lg"><Calendar className="h-5 w-5 text-purple-400" /></div>
              <span className="text-sm font-medium text-muted-foreground">Daily Reset</span>
            </div>
            <p className="text-xl font-semibold text-foreground">{usage?.period}</p>
            <p className="text-sm text-muted-foreground mt-1">
              Resets {usage?.reset_at ? new Date(usage.reset_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'tomorrow'} (midnight UTC)
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Usage Warning */}
      {!isUnlimited && usagePercent >= 80 && (
        <Alert variant={usagePercent >= 90 ? 'destructive' : 'warning'}>
          <AlertCircle className="h-5 w-5" />
          <AlertDescription>
            <p className="font-medium">{usagePercent >= 90 ? 'Daily limit almost reached' : 'Approaching daily limit'}</p>
            <p className="text-sm mt-1">You've used {usagePercent}% of your daily quota. Upgrade to Pro for unlimited requests.</p>
          </AlertDescription>
        </Alert>
      )}

      {/* Plans */}
      <div>
        <h2 className="text-lg font-semibold text-foreground mb-4">Available Plans</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {plans.map((plan) => {
            const isCurrent = plan.id === user?.plan;
            const isFree = plan.id === 'free';
            const isEnterprise = plan.id === 'enterprise';
            const isPro = plan.id === 'pro';
            const planDailyLimit = plan.daily_request_limit;
            const planMinuteLimit = plan.requests_per_minute;
            const isDailyUnlimited = planDailyLimit === -1;
            const isMinuteUnlimited = planMinuteLimit === -1;
            const isUpgrade = !isCurrent && ((isFree && (isPro || isEnterprise)) || (user?.plan === 'free' && !isFree));

            return (
              <Card key={plan.id} className={`relative ${isCurrent ? 'border-primary border-2' : ''} ${isPro && !isCurrent ? 'border-primary/50' : ''}`}>
                <CardContent className="p-6">
                  {isCurrent && <Badge className="absolute -top-3 left-4">Current</Badge>}
                  {isPro && !isCurrent && <Badge variant="secondary" className="absolute -top-3 right-4">Recommended</Badge>}

                  <div className="flex items-center gap-2 mb-2">
                    <Zap className={`h-5 w-5 ${isCurrent ? 'text-primary' : 'text-muted-foreground'}`} />
                    <h3 className="font-semibold text-foreground">{plan.name}</h3>
                  </div>

                  {isEnterprise ? (
                    <p className="text-2xl font-bold text-foreground mb-4">Custom<span className="text-sm font-normal text-muted-foreground block">Contact us</span></p>
                  ) : (
                    <p className="text-3xl font-bold text-foreground mb-4">${plan.price_monthly}<span className="text-sm font-normal text-muted-foreground">/mo</span></p>
                  )}

                  <ul className="space-y-2 text-sm text-muted-foreground mb-6">
                    <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 bg-primary rounded-full" />Unlimited n8n instances</li>
                    <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 bg-primary rounded-full" />{isEnterprise ? 'Custom' : isMinuteUnlimited ? 'Unlimited' : planMinuteLimit} req/min</li>
                    <li className="flex items-center gap-2">
                      <span className={`w-1.5 h-1.5 rounded-full ${isDailyUnlimited ? 'bg-emerald-400' : 'bg-primary'}`} />
                      {isEnterprise ? 'Custom daily quota' : isDailyUnlimited ? <span className="text-emerald-400 font-semibold">Unlimited req/day</span> : `${planDailyLimit.toLocaleString()} req/day`}
                    </li>
                    <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 bg-primary rounded-full" />{plan.features?.support || 'Community'} support</li>
                  </ul>

                  {isCurrent ? (
                    <Button variant="secondary" className="w-full" disabled>Current Plan</Button>
                  ) : isEnterprise ? (
                    <Button variant="secondary" className="w-full" asChild><a href="mailto:contact@node2flow.net?subject=Enterprise%20Inquiry">Contact Sales</a></Button>
                  ) : isUpgrade ? (
                    <Button className="w-full" onClick={() => handleChangePlan(plan.id)} disabled={checkoutLoading === plan.id}>
                      {checkoutLoading === plan.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <>Upgrade <ArrowUpRight className="h-4 w-4" /></>}
                    </Button>
                  ) : (
                    <Button variant="secondary" className="w-full" onClick={() => handleChangePlan(plan.id)} disabled={checkoutLoading === plan.id}>
                      {checkoutLoading === plan.id ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Downgrade'}
                    </Button>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
