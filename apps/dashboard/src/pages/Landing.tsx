import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getPlans, getPlatformStats } from '../lib/platform-api';
import type { Plan, PlatformStats } from '../lib/platform-api';
import { plugins } from '../plugins/registry';

// HeroUI components
import { Navbar, NavbarBrand, NavbarContent, NavbarItem, NavbarMenuToggle, NavbarMenu, NavbarMenuItem } from '@heroui/navbar';
import { Button } from '@heroui/button';
import { Card, CardBody, CardFooter, CardHeader } from '@heroui/card';
import { Chip } from '@heroui/chip';
import { Divider } from '@heroui/divider';
import { Link as HeroLink } from '@heroui/link';
import { Snippet } from '@heroui/snippet';

// framer-motion
import { motion } from 'framer-motion';

// Icons
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
  Menu,
  ChevronDown,
} from 'lucide-react';

// Animation variants
const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { opacity: 1, scale: 1 },
};

export default function Landing() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [stats, setStats] = useState<PlatformStats | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    getPlans().then((res) => { if (res.success && res.data) setPlans(res.data.plans); });
    getPlatformStats().then((res) => { if (res.success && res.data) setStats(res.data); });
  }, []);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <Navbar
        isBordered
        isBlurred
        maxWidth="xl"
        isMenuOpen={isMenuOpen}
        onMenuOpenChange={setIsMenuOpen}
        classNames={{
          base: 'bg-background/70 backdrop-blur-lg',
          wrapper: 'px-4 sm:px-6',
        }}
      >
        <NavbarContent justify="start">
          <NavbarBrand>
            <Link to="/" className="flex items-center gap-2">
              <div className="bg-white p-2 rounded-lg">
                <Zap className="h-5 w-5 text-black" />
              </div>
              <span className="text-xl font-bold text-foreground">Node2Flow</span>
            </Link>
          </NavbarBrand>
        </NavbarContent>

        <NavbarContent justify="end" className="hidden sm:flex gap-4">
          <NavbarItem>
            <Link to="/docs" className="text-muted-foreground hover:text-foreground transition-colors">Docs</Link>
          </NavbarItem>
          <NavbarItem>
            <Link to="/faq" className="text-muted-foreground hover:text-foreground transition-colors">FAQ</Link>
          </NavbarItem>
          <NavbarItem>
            <Link to="/login" className="text-muted-foreground hover:text-foreground transition-colors">Sign In</Link>
          </NavbarItem>
          <NavbarItem>
            <Button as={Link} to="/register" color="primary" variant="flat" size="sm" radius="lg">
              Get Started
            </Button>
          </NavbarItem>
        </NavbarContent>

        <NavbarContent justify="end" className="sm:hidden">
          <NavbarMenuToggle aria-label={isMenuOpen ? 'Close menu' : 'Open menu'} />
        </NavbarContent>

        <NavbarMenu className="bg-background/95 backdrop-blur-lg pt-6">
          <NavbarMenuItem>
            <Link to="/docs" className="w-full text-lg text-foreground py-2 block" onClick={() => setIsMenuOpen(false)}>Docs</Link>
          </NavbarMenuItem>
          <NavbarMenuItem>
            <Link to="/faq" className="w-full text-lg text-foreground py-2 block" onClick={() => setIsMenuOpen(false)}>FAQ</Link>
          </NavbarMenuItem>
          <NavbarMenuItem>
            <Link to="/login" className="w-full text-lg text-foreground py-2 block" onClick={() => setIsMenuOpen(false)}>Sign In</Link>
          </NavbarMenuItem>
          <NavbarMenuItem>
            <Link to="/register" className="w-full text-lg text-green-400 font-semibold py-2 block" onClick={() => setIsMenuOpen(false)}>Get Started</Link>
          </NavbarMenuItem>
        </NavbarMenu>
      </Navbar>

      {/* Hero Section */}
      <section className="py-24 bg-gradient-to-b from-white/[0.02] via-card to-background relative overflow-hidden">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeInUp}
            transition={{ duration: 0.6 }}
          >
            <Chip variant="flat" size="md" className="mb-6 bg-white/5 text-muted-foreground">
              Open Source MCP Gateway
            </Chip>
            <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-6 leading-tight">
              Connect Your Tools<br />with AI
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
              One MCP gateway for n8n, WordPress, and more. Let Claude, Cursor, or any MCP client manage your services through natural language.
            </p>
          </motion.div>

          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeInUp}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex items-center justify-center gap-4 mb-12"
          >
            <Button
              as={Link}
              to="/register"
              color="primary"
              size="lg"
              radius="lg"
              endContent={<ArrowRight className="h-5 w-5" />}
              className="font-semibold"
            >
              Start Free
            </Button>
            <Button
              as="a"
              href="https://modelcontextprotocol.io"
              target="_blank"
              rel="noopener noreferrer"
              variant="bordered"
              size="lg"
              radius="lg"
              startContent={<BookOpen className="h-5 w-5" />}
              className="border-border text-foreground"
            >
              Learn about MCP
            </Button>
          </motion.div>

          {/* Demo Code Block */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={scaleIn}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <div className="max-w-2xl mx-auto bg-black rounded-xl p-6 text-left shadow-2xl border border-border">
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
          </motion.div>
        </div>
      </section>

      {/* Platform Stats */}
      {stats && (
        <section className="py-16 border-b border-border bg-gradient-to-b from-background to-card/50">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <p className="text-center text-sm font-medium text-muted-foreground uppercase tracking-wider mb-8">
              Trusted by developers worldwide
            </p>
            <motion.div
              className="grid grid-cols-2 md:grid-cols-4 gap-4"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-50px' }}
              variants={staggerContainer}
            >
              <StatCard icon={<Users className="h-5 w-5 text-blue-400" />} value={stats.total_users} label="Total Users" gradient="from-blue-500/5" />
              <StatCard icon={<Activity className="h-5 w-5 text-purple-400" />} value={stats.total_executions} label="Tool Executions" gradient="from-purple-500/5" />
              <StatCard icon={<CheckCircle className="h-5 w-5 text-green-400" />} value={stats.total_successes} label="Successful" gradient="from-green-500/5" />
              <StatCard icon={<TrendingUp className="h-5 w-5 text-amber-400" />} value={stats.pass_rate} label="Pass Rate" gradient="from-amber-500/5" suffix="%" />
            </motion.div>
          </div>
        </section>
      )}

      {/* Products Section */}
      <section className="py-16 bg-gradient-to-b from-background to-card/30">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-10"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
            transition={{ duration: 0.5 }}
          >
            <Chip variant="flat" size="sm" className="mb-4 bg-white/5 text-muted-foreground">Integrations</Chip>
            <h2 className="text-3xl font-bold text-foreground mb-4">{plugins.length} Products, One Gateway</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Connect your AI assistant to multiple services through a single MCP endpoint.
            </p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={scaleIn}
            transition={{ duration: 0.6 }}
          >
            <Card classNames={{ base: 'bg-card border border-border', body: 'p-6 sm:p-8' }}>
              <CardBody>
                <div className="flex flex-wrap justify-center gap-4">
                  {plugins.map((plugin) => {
                    const Icon = plugin.icon;
                    return (
                      <div
                        key={plugin.id}
                        className="group flex flex-col items-center gap-1.5 w-16 sm:w-20"
                        title={plugin.content.tagline}
                      >
                        <div className="bg-white/5 group-hover:bg-white/10 w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center transition-colors">
                          {plugin.logo ? (
                            <img src={plugin.logo} alt={plugin.name} className="h-5 w-5 sm:h-6 sm:w-6" />
                          ) : (
                            <Icon className="h-5 w-5 sm:h-6 sm:w-6 text-muted-foreground" />
                          )}
                        </div>
                        <span className="text-[10px] sm:text-xs text-muted-foreground text-center leading-tight truncate w-full">
                          {plugin.name}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </CardBody>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-16"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
            transition={{ duration: 0.5 }}
          >
            <Chip variant="flat" size="sm" className="mb-4 bg-white/5 text-muted-foreground">Features</Chip>
            <h2 className="text-3xl font-bold text-foreground mb-4">Everything you need to automate with AI</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Our MCP server provides a complete interface between your AI assistant and your tools.
            </p>
          </motion.div>

          <motion.div
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-50px' }}
            variants={staggerContainer}
          >
            <FeatureCard icon={<Bot className="h-6 w-6" />} title="AI-Powered Control" description="Let your AI assistant manage workflows, create automations, and handle executions through natural language." />
            <FeatureCard icon={<Shield className="h-6 w-6" />} title="Secure by Design" description="Your credentials are encrypted at rest with AES-256-GCM. API keys are hashed and can be revoked instantly." />
            <FeatureCard icon={<Layers className="h-6 w-6" />} title="Multi-Service Support" description="Connect multiple services across different platforms. Manage n8n, WordPress, and more from one place." />
            <FeatureCard icon={<BarChart3 className="h-6 w-6" />} title="Usage Analytics" description="Track API usage, monitor success rates, and optimize your automation workflows." />
            <FeatureCard icon={<Zap className="h-6 w-6" />} title="Edge Deployment" description="Deployed on Cloudflare Workers for low latency worldwide. Your AI gets instant responses." />
            <FeatureCard icon={<Shield className="h-6 w-6" />} title="Scoped API Keys" description="Control access per-plugin and per-permission. Create read-only keys or full-access keys with expiry dates." />
          </motion.div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-gradient-to-b from-card/30 to-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-16"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
            transition={{ duration: 0.5 }}
          >
            <Chip variant="flat" size="sm" className="mb-4 bg-white/5 text-muted-foreground">Quick Setup</Chip>
            <h2 className="text-3xl font-bold text-foreground mb-4">Get started in 3 steps</h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8 relative">
            {/* Connecting line */}
            <div className="hidden md:block absolute top-6 left-[20%] right-[20%] h-px bg-gradient-to-r from-transparent via-border to-transparent" />

            <StepCard number={1} title="Create Account" description="Sign up with email or OAuth (GitHub/Google). No credit card required for free tier." />
            <StepCard number={2} title="Add Connection" description="Connect your n8n, WordPress, or other services. We'll encrypt and securely store your credentials." />
            <StepCard number={3} title="Configure MCP Client" description="Add the MCP server URL and your API key to Claude Desktop, Cursor, or any MCP client." />
          </div>

          <motion.div
            className="mt-12 max-w-2xl mx-auto"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={scaleIn}
            transition={{ duration: 0.6 }}
          >
            <Card classNames={{ base: 'bg-card border border-border', body: 'p-0' }}>
              <CardHeader className="px-6 pt-5 pb-0">
                <p className="text-sm font-semibold text-foreground">MCP Client Configuration</p>
              </CardHeader>
              <CardBody>
                <div className="px-6 pb-5">
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
                </div>
              </CardBody>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-16"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-3xl font-bold text-foreground mb-4">Simple, transparent pricing</h2>
            <p className="text-lg text-muted-foreground">Start free, upgrade when you need more.</p>
          </motion.div>

          <motion.div
            className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-50px' }}
            variants={staggerContainer}
          >
            {plans.map((plan) => (
              <motion.div key={plan.id} variants={fadeInUp} transition={{ duration: 0.4 }}>
                <PricingCard plan={plan} />
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <motion.section
        className="py-24 bg-gradient-to-t from-white/[0.02] via-card to-background border-t border-border relative overflow-hidden"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={fadeInUp}
        transition={{ duration: 0.6 }}
      >
        <div className="absolute top-0 right-1/3 w-72 h-72 bg-blue-500/5 rounded-full blur-3xl" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Ready to automate with AI?</h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join developers using Node2Flow to supercharge their automation workflows.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Button
              as={Link}
              to="/register"
              color="primary"
              size="lg"
              radius="lg"
              endContent={<ArrowRight className="h-5 w-5" />}
              className="font-semibold"
            >
              Get Started Free
            </Button>
            <Button
              as={Link}
              to="/docs"
              variant="bordered"
              size="lg"
              radius="lg"
              className="border-border text-foreground"
            >
              Read the Docs
            </Button>
          </div>
        </div>
      </motion.section>

      {/* Footer */}
      <footer className="py-16 border-t border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-8 mb-12">
            <div>
              <h3 className="text-foreground font-semibold mb-4">Product</h3>
              <ul className="space-y-3">
                <li><a href="#features" className="text-muted-foreground hover:text-foreground transition-colors">Features</a></li>
                <li><a href="#pricing" className="text-muted-foreground hover:text-foreground transition-colors">Pricing</a></li>
                <li><Link to="/faq" className="text-muted-foreground hover:text-foreground transition-colors">FAQ</Link></li>
                <li><Link to="/status" className="text-muted-foreground hover:text-foreground transition-colors">Status</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-foreground font-semibold mb-4">Resources</h3>
              <ul className="space-y-3">
                <li><Link to="/docs" className="text-muted-foreground hover:text-foreground transition-colors">Documentation</Link></li>
                <li><Link to="/docs?tab=api" className="text-muted-foreground hover:text-foreground transition-colors">API Reference</Link></li>
                <li>
                  <a href="https://modelcontextprotocol.io" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-1">
                    MCP Protocol <ExternalLink className="h-3 w-3" />
                  </a>
                </li>
                <li>
                  <DocDropdown />
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-foreground font-semibold mb-4">Company</h3>
              <ul className="space-y-3">
                <li><a href="mailto:contact@node2flow.net" className="text-muted-foreground hover:text-foreground transition-colors">Contact</a></li>
                <li><Link to="/privacy" className="text-muted-foreground hover:text-foreground transition-colors">Privacy Policy</Link></li>
                <li><Link to="/terms" className="text-muted-foreground hover:text-foreground transition-colors">Terms of Service</Link></li>
              </ul>
            </div>
          </div>
          <Divider className="bg-border" />
          <div className="pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="bg-white p-2 rounded-lg">
                <Zap className="h-4 w-4 text-black" />
              </div>
              <span className="text-lg font-bold text-foreground">Node2Flow</span>
            </div>
            <p className="text-muted-foreground text-sm">&copy; {new Date().getFullYear()} Node2Flow. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

// ============================================
// Sub-components
// ============================================

function StatCard({ icon, value, label, gradient, suffix }: {
  icon: React.ReactNode;
  value: number;
  label: string;
  gradient: string;
  suffix?: string;
}) {
  return (
    <motion.div variants={fadeInUp} transition={{ duration: 0.4 }}>
      <Card
        isHoverable
        classNames={{
          base: `bg-gradient-to-t ${gradient} to-card border border-border hover:border-white/20 transition-all`,
          body: 'p-6 text-center',
        }}
      >
        <CardBody>
          <div className="mx-auto mb-2">{icon}</div>
          <p className="text-3xl font-bold text-foreground tabular-nums">
            {value.toLocaleString()}{suffix}
          </p>
          <p className="text-sm text-muted-foreground mt-1">{label}</p>
        </CardBody>
      </Card>
    </motion.div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <motion.div variants={fadeInUp} transition={{ duration: 0.4 }}>
      <Card
        isHoverable
        classNames={{
          base: 'bg-card border border-border hover:border-white/20 transition-all h-full',
          body: 'p-6',
        }}
      >
        <CardBody>
          <div className="bg-white/5 w-12 h-12 rounded-lg flex items-center justify-center text-muted-foreground mb-4">{icon}</div>
          <h3 className="text-lg font-semibold text-foreground mb-2">{title}</h3>
          <p className="text-muted-foreground">{description}</p>
        </CardBody>
      </Card>
    </motion.div>
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
    <Card
      isHoverable
      classNames={{
        base: `border ${isPopular ? 'border-white border-2 shadow-lg scale-105' : 'border-border'} bg-card hover:border-white/30 transition-all relative`,
        body: 'p-6',
      }}
    >
      <CardBody>
        {isPopular && (
          <Chip
            color="primary"
            variant="flat"
            size="sm"
            className="absolute -top-3 left-1/2 -translate-x-1/2"
          >
            Most Popular
          </Chip>
        )}
        <h3 className="text-xl font-semibold text-foreground mb-2">{plan.name}</h3>
        <div className="mb-6">
          {isEnterprise ? (
            <div>
              <span className="text-2xl font-bold text-foreground">Custom</span>
              <p className="text-muted-foreground text-sm mt-1">Contact us</p>
            </div>
          ) : (
            <>
              <span className="text-4xl font-bold text-foreground">${plan.price_monthly}</span>
              <span className="text-muted-foreground">/month</span>
            </>
          )}
        </div>
        <ul className="space-y-3 mb-6">
          <li className="flex items-center gap-2 text-sm text-muted-foreground">
            <Check className="h-4 w-4 text-green-400 shrink-0" />
            {isEnterprise ? 'Custom' : 'Unlimited'} service connections
          </li>
          <li className="flex items-center gap-2 text-sm text-muted-foreground">
            <Check className="h-4 w-4 text-green-400 shrink-0" />
            {isEnterprise ? 'Custom rate limits' : (
              <span>{isMinuteUnlimited ? 'Unlimited' : minuteLimit} req/min{features.fair_use && <span className="text-muted-foreground"> (fair use)</span>}</span>
            )}
          </li>
          <li className="flex items-center gap-2 text-sm text-muted-foreground">
            <Check className="h-4 w-4 text-green-400 shrink-0" />
            {isEnterprise ? 'Custom daily quota' : isDailyUnlimited ? (
              <span className="font-semibold text-foreground">Unlimited req/day</span>
            ) : (
              <span>{dailyLimit.toLocaleString()} req/day</span>
            )}
          </li>
          {features.analytics && (
            <li className="flex items-center gap-2 text-sm text-muted-foreground">
              <Check className="h-4 w-4 text-green-400 shrink-0" />Usage analytics
            </li>
          )}
          {features.support && (
            <li className="flex items-center gap-2 text-sm text-muted-foreground">
              <Check className="h-4 w-4 text-green-400 shrink-0" />
              {features.support.charAt(0).toUpperCase() + features.support.slice(1)} support
            </li>
          )}
          {features.private_server && (
            <li className="flex items-center gap-2 text-sm text-muted-foreground">
              <Check className="h-4 w-4 text-green-400 shrink-0" />Private MCP server
            </li>
          )}
        </ul>
        {isFree ? (
          <Button as={Link} to="/register" variant="bordered" className="w-full border-border text-foreground" radius="lg">
            Start Free
          </Button>
        ) : isEnterprise ? (
          <Button as="a" href="mailto:contact@node2flow.net?subject=Enterprise%20Inquiry" variant="bordered" className="w-full border-border text-foreground" radius="lg">
            Contact Sales
          </Button>
        ) : (
          <Button as={Link} to="/register" color="primary" className="w-full font-semibold" radius="lg">
            Get Started
          </Button>
        )}
      </CardBody>
    </Card>
  );
}

function DocDropdown() {
  const [open, setOpen] = useState(false);
  const docPlugins = plugins.filter((p) => p.content.externalDocUrl);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-1 text-sm"
      >
        Plugin Docs <ChevronDown className={`h-3 w-3 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="absolute bottom-full left-0 mb-2 w-56 max-h-64 overflow-y-auto bg-card border border-border rounded-lg shadow-xl z-50">
          {docPlugins.map((plugin) => (
            <a
              key={plugin.id}
              href={plugin.content.externalDocUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-white/5 transition-colors"
              onClick={() => setOpen(false)}
            >
              {plugin.logo ? (
                <img src={plugin.logo} alt={plugin.name} className="h-4 w-4 shrink-0" />
              ) : (
                <plugin.icon className="h-4 w-4 shrink-0" />
              )}
              {plugin.name}
              <ExternalLink className="h-3 w-3 ml-auto shrink-0 opacity-50" />
            </a>
          ))}
        </div>
      )}
    </div>
  );
}

function StepCard({ number, title, description }: { number: number; title: string; description: string }) {
  return (
    <motion.div
      className="text-center relative"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      variants={fadeInUp}
      transition={{ duration: 0.5, delay: number * 0.15 }}
    >
      <div className="bg-white w-12 h-12 rounded-full flex items-center justify-center text-black font-bold text-xl mx-auto mb-4 relative z-10">
        {number}
      </div>
      <h3 className="text-lg font-semibold text-foreground mb-2">{title}</h3>
      <p className="text-muted-foreground">{description}</p>
    </motion.div>
  );
}
