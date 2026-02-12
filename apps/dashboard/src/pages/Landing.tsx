import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getPlans, getPlatformStats } from '../lib/platform-api';
import type { Plan, PlatformStats } from '../lib/platform-api';
import { plugins } from '../plugins/registry';
import { Button, Card, CardContent, CardHeader, CardTitle, Badge, Separator } from '@node2flow/dashboard-core';
import {
  Zap,
  Shield,
  BarChart3,
  Layers,
  Bot,
  Check,
  ArrowRight,
  BookOpen,
  ExternalLink,
  Users,
  Activity,
  CheckCircle,
  TrendingUp,
} from 'lucide-react';





export default function Landing() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [stats, setStats] = useState<PlatformStats | null>(null);

  useEffect(() => {
    getPlans().then((res) => { if (res.success && res.data) setPlans(res.data.plans); });
    getPlatformStats().then((res) => { if (res.success && res.data) setStats(res.data); });
  }, []);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <div className="bg-primary p-2 rounded-lg">
                <Zap className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold text-foreground">Node2Flow</span>
            </div>
            <div className="flex items-center gap-4">
              <Button variant="ghost" asChild>
                <Link to="/login">Sign In</Link>
              </Button>
              <Button asChild>
                <Link to="/register">Get Started</Link>
              </Button>
            </div>
          </div>
        </div>
        <Separator />
      </header>

      {/* Hero Section */}
      <section className="py-24 bg-gradient-to-b from-primary/5 via-card to-background relative overflow-hidden">
        {/* Decorative gradient orbs */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative">
          <Badge variant="secondary" className="mb-6 px-4 py-1.5 text-sm">Open Source MCP Gateway</Badge>
          <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-6 leading-tight">Connect Your Tools with AI</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
            One MCP gateway for n8n, WordPress, and more. Let Claude, Cursor, or any MCP client manage your services through natural language.
          </p>
          <div className="flex items-center justify-center gap-4 mb-12">
            <Button size="lg" asChild>
              <Link to="/register">Start Free <ArrowRight className="h-5 w-5 ml-2" /></Link>
            </Button>
            <Button variant="secondary" size="lg" asChild>
              <a href="https://modelcontextprotocol.io" target="_blank" rel="noopener noreferrer">
                <BookOpen className="h-5 w-5 mr-2" /> Learn about MCP
              </a>
            </Button>
          </div>

          {/* Demo Code Block */}
          <div className="max-w-2xl mx-auto bg-black rounded-xl p-6 text-left shadow-2xl">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-3 h-3 rounded-full bg-red-500" />
              <div className="w-3 h-3 rounded-full bg-yellow-500" />
              <div className="w-3 h-3 rounded-full bg-green-500" />
              <span className="ml-2 text-muted-foreground text-sm">Claude Desktop</span>
            </div>
            <pre className="text-sm text-green-400 overflow-x-auto">
              <code>{`> List my active n8n workflows

Found 5 active workflows in your n8n instance.

> Create a WordPress post about our new release

✅ Created draft post "New Release v2.0" on your WordPress site.

> Search for HTTP Request nodes in n8n

Found 3 matching nodes: HTTP Request, HTTP Request Tool, Webhook`}</code>
            </pre>
          </div>
        </div>
      </section>

      {/* Platform Stats */}
      {stats && (
        <section className="py-16 border-b border-border bg-gradient-to-b from-background to-card/50">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <p className="text-center text-sm font-medium text-muted-foreground uppercase tracking-wider mb-8">Trusted by developers worldwide</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card className="bg-gradient-to-t from-blue-500/5 to-card shadow-sm text-center">
                <CardContent className="p-6">
                  <Users className="h-5 w-5 text-blue-400 mx-auto mb-2" />
                  <p className="text-3xl font-bold text-foreground tabular-nums">{stats.total_users.toLocaleString()}</p>
                  <p className="text-sm text-muted-foreground mt-1">Total Users</p>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-t from-primary/5 to-card shadow-sm text-center">
                <CardContent className="p-6">
                  <Activity className="h-5 w-5 text-primary mx-auto mb-2" />
                  <p className="text-3xl font-bold text-foreground tabular-nums">{stats.total_executions.toLocaleString()}</p>
                  <p className="text-sm text-muted-foreground mt-1">Tool Executions</p>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-t from-emerald-500/5 to-card shadow-sm text-center">
                <CardContent className="p-6">
                  <CheckCircle className="h-5 w-5 text-emerald-400 mx-auto mb-2" />
                  <p className="text-3xl font-bold text-foreground tabular-nums">{stats.total_successes.toLocaleString()}</p>
                  <p className="text-sm text-muted-foreground mt-1">Successful</p>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-t from-purple-500/5 to-card shadow-sm text-center">
                <CardContent className="p-6">
                  <TrendingUp className="h-5 w-5 text-purple-400 mx-auto mb-2" />
                  <p className="text-3xl font-bold text-foreground tabular-nums">{stats.pass_rate}%</p>
                  <p className="text-sm text-muted-foreground mt-1">Pass Rate</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      )}

      {/* Products Section */}
      <section className="py-20 bg-gradient-to-b from-background to-card/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge variant="secondary" className="mb-4 px-3 py-1">Integrations</Badge>
            <h2 className="text-3xl font-bold text-foreground mb-4">{plugins.length} Products, One Gateway</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">Connect your AI assistant to multiple services through a single MCP endpoint.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {plugins.map((plugin, idx) => {
              const Icon = plugin.icon;
              const gradients = [
                'from-primary/5 to-card',
                'from-purple-500/5 to-card',
                'from-emerald-500/5 to-card',
                'from-amber-500/5 to-card',
                'from-blue-500/5 to-card',
                'from-rose-500/5 to-card',
                'from-cyan-500/5 to-card',
              ];
              return (
                <Card key={plugin.id} className={`text-center hover:border-primary/30 hover:shadow-xl transition-all p-8 bg-gradient-to-t ${gradients[idx % gradients.length]}`}>
                  <div className="bg-primary/10 w-16 h-16 rounded-2xl flex items-center justify-center text-primary mx-auto mb-6">
                    {plugin.logo ? (
                      <img src={plugin.logo} alt={plugin.name} className="h-10 w-10" />
                    ) : (
                      <Icon className="h-8 w-8" />
                    )}
                  </div>
                  <h3 className="text-xl font-semibold text-foreground mb-2">{plugin.name}</h3>
                  <p className="text-muted-foreground mb-4">{plugin.content.tagline}</p>
                  <p className="text-sm text-muted-foreground">{plugin.content.description}</p>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge variant="secondary" className="mb-4 px-3 py-1">Features</Badge>
            <h2 className="text-3xl font-bold text-foreground mb-4">Everything you need to automate with AI</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">Our MCP server provides a complete interface between your AI assistant and your tools.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard icon={<Bot className="h-6 w-6" />} title="AI-Powered Control" description="Let your AI assistant manage workflows, create automations, and handle executions through natural language." />
            <FeatureCard icon={<Shield className="h-6 w-6" />} title="Secure by Design" description="Your credentials are encrypted at rest with AES-256-GCM. API keys are hashed and can be revoked instantly." />
            <FeatureCard icon={<Layers className="h-6 w-6" />} title="Multi-Service Support" description="Connect multiple services across different platforms. Manage n8n, WordPress, and more from one place." />
            <FeatureCard icon={<BarChart3 className="h-6 w-6" />} title="Usage Analytics" description="Track API usage, monitor success rates, and optimize your automation workflows." />
            {plugins.flatMap(p => p.content.features).map((f, i) => (
              <FeatureCard key={`plugin-feature-${i}`} icon={f.icon} title={f.title} description={f.description} />
            ))}
            <FeatureCard icon={<Zap className="h-6 w-6" />} title="Edge Deployment" description="Deployed on Cloudflare Workers for low latency worldwide. Your AI gets instant responses." />
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-gradient-to-b from-card/30 to-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge variant="secondary" className="mb-4 px-3 py-1">Quick Setup</Badge>
            <h2 className="text-3xl font-bold text-foreground mb-4">Get started in 3 steps</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <StepCard number={1} title="Create Account" description="Sign up with email or OAuth (GitHub/Google). No credit card required for free tier." />
            <StepCard number={2} title="Add Connection" description="Connect your n8n, WordPress, or other services. We'll encrypt and securely store your credentials." />
            <StepCard number={3} title="Configure MCP Client" description="Add the MCP server URL and your API key to Claude Desktop, Cursor, or any MCP client." />
          </div>
          <div className="mt-12 max-w-2xl mx-auto">
            <Card>
              <CardHeader><CardTitle>MCP Client Configuration</CardTitle></CardHeader>
              <CardContent>
                <pre className="bg-black rounded-lg p-4 text-sm text-green-400 overflow-x-auto">
{`{
  "mcpServers": {
    "node2flow": {
      "url": "https://mcp.node2flow.net/mcp",
      "headers": {
        "Authorization": "Bearer YOUR_API_KEY"
      }
    }
  }
}`}
                </pre>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-foreground mb-4">Simple, transparent pricing</h2>
            <p className="text-lg text-muted-foreground">Start free, upgrade when you need more.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {plans.map((plan) => (<PricingCard key={plan.id} plan={plan} />))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-t from-primary/5 via-card to-background border-t border-border relative overflow-hidden">
        <div className="absolute top-0 right-1/3 w-72 h-72 bg-primary/5 rounded-full blur-3xl" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Ready to automate with AI?</h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">Join developers using Node2Flow to supercharge their automation workflows.</p>
          <div className="flex items-center justify-center gap-4">
            <Button size="lg" asChild>
              <Link to="/register">Get Started Free <ArrowRight className="h-5 w-5 ml-2" /></Link>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <Link to="/docs">Read the Docs</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-16 border-t border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-8 mb-12">
            <div>
              <h3 className="text-foreground font-semibold mb-4">Product</h3>
              <ul className="space-y-3">
                <li><a href="#features" className="text-muted-foreground hover:text-primary">Features</a></li>
                <li><a href="#pricing" className="text-muted-foreground hover:text-primary">Pricing</a></li>
                <li><Link to="/faq" className="text-muted-foreground hover:text-primary">FAQ</Link></li>
                <li><Link to="/status" className="text-muted-foreground hover:text-primary">Status</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-foreground font-semibold mb-4">Resources</h3>
              <ul className="space-y-3">
                <li><Link to="/docs" className="text-muted-foreground hover:text-primary">Documentation</Link></li>
                <li><Link to="/docs?tab=api" className="text-muted-foreground hover:text-primary">API Reference</Link></li>
                <li><a href="https://modelcontextprotocol.io" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary inline-flex items-center gap-1">MCP Protocol <ExternalLink className="h-3 w-3" /></a></li>
                {plugins.filter(p => p.content.externalDocUrl).map(p => (
                  <li key={p.id}><a href={p.content.externalDocUrl} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary inline-flex items-center gap-1">{p.name} Docs <ExternalLink className="h-3 w-3" /></a></li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="text-foreground font-semibold mb-4">Company</h3>
              <ul className="space-y-3">
                <li><a href="mailto:contact@node2flow.net" className="text-muted-foreground hover:text-primary">Contact</a></li>
                <li><Link to="/privacy" className="text-muted-foreground hover:text-primary">Privacy Policy</Link></li>
                <li><Link to="/terms" className="text-muted-foreground hover:text-primary">Terms of Service</Link></li>
              </ul>
            </div>
          </div>
          <Separator />
          <div className="pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="bg-primary p-2 rounded-lg"><Zap className="h-4 w-4 text-primary-foreground" /></div>
              <span className="text-lg font-bold text-foreground">Node2Flow</span>
            </div>
            <p className="text-muted-foreground text-sm">&copy; {new Date().getFullYear()} Node2Flow. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <Card className="hover:border-primary/30 hover:shadow-lg transition-all">
      <CardContent className="p-6">
        <div className="bg-primary/10 w-12 h-12 rounded-lg flex items-center justify-center text-primary mb-4">{icon}</div>
        <h3 className="text-lg font-semibold text-foreground mb-2">{title}</h3>
        <p className="text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
}

function PricingCard({ plan }: { plan: Plan }) {
  const isPopular = plan.id === 'pro';
  const isFree = plan.id === 'free';
  const isEnterprise = plan.id === 'enterprise';
  const features = plan.features as Record<string, any>;
  const dailyLimit = plan.daily_request_limit;
  const minuteLimit = plan.requests_per_minute;
  const isDailyUnlimited = dailyLimit === -1;
  const isMinuteUnlimited = minuteLimit === -1;

  return (
    <Card className={`relative ${isPopular ? 'border-primary border-2 shadow-lg scale-105' : ''}`}>
      <CardContent className="p-6">
        {isPopular && (
          <Badge className="absolute -top-3 left-1/2 -translate-x-1/2">Most Popular</Badge>
        )}
        <h3 className="text-xl font-semibold text-foreground mb-2">{plan.name}</h3>
        <div className="mb-6">
          {isEnterprise ? (
            <div><span className="text-2xl font-bold text-foreground">Custom</span><p className="text-muted-foreground text-sm mt-1">Contact us</p></div>
          ) : (
            <><span className="text-4xl font-bold text-foreground">${plan.price_monthly}</span><span className="text-muted-foreground">/month</span></>
          )}
        </div>
        <ul className="space-y-3 mb-6">
          <li className="flex items-center gap-2 text-sm text-muted-foreground"><Check className="h-4 w-4 text-emerald-400" />{isEnterprise ? 'Custom' : 'Unlimited'} service connections</li>
          <li className="flex items-center gap-2 text-sm text-muted-foreground"><Check className="h-4 w-4 text-emerald-400" />{isEnterprise ? 'Custom rate limits' : <span>{isMinuteUnlimited ? 'Unlimited' : minuteLimit} req/min{features.fair_use && <span className="text-muted-foreground"> (fair use)</span>}</span>}</li>
          <li className="flex items-center gap-2 text-sm text-muted-foreground"><Check className="h-4 w-4 text-emerald-400" />{isEnterprise ? 'Custom daily quota' : isDailyUnlimited ? <span className="text-primary font-semibold">Unlimited req/day</span> : <span>{dailyLimit.toLocaleString()} req/day</span>}</li>
          {features.analytics && <li className="flex items-center gap-2 text-sm text-muted-foreground"><Check className="h-4 w-4 text-emerald-400" />Usage analytics</li>}
          {features.support && <li className="flex items-center gap-2 text-sm text-muted-foreground"><Check className="h-4 w-4 text-emerald-400" />{features.support.charAt(0).toUpperCase() + features.support.slice(1)} support</li>}
          {features.private_server && <li className="flex items-center gap-2 text-sm text-muted-foreground"><Check className="h-4 w-4 text-emerald-400" />Private MCP server</li>}
        </ul>
        {isFree ? (
          <Button variant="secondary" className="w-full" asChild><Link to="/register">Start Free</Link></Button>
        ) : isEnterprise ? (
          <Button variant="secondary" className="w-full" asChild><a href="mailto:contact@node2flow.net?subject=Enterprise%20Inquiry">Contact Sales</a></Button>
        ) : (
          <Button className="w-full" asChild><Link to="/register">Get Started</Link></Button>
        )}
      </CardContent>
    </Card>
  );
}

function StepCard({ number, title, description }: { number: number; title: string; description: string }) {
  return (
    <div className="text-center">
      <div className="bg-primary w-12 h-12 rounded-full flex items-center justify-center text-primary-foreground font-bold text-xl mx-auto mb-4">{number}</div>
      <h3 className="text-lg font-semibold text-foreground mb-2">{title}</h3>
      <p className="text-muted-foreground">{description}</p>
    </div>
  );
}
