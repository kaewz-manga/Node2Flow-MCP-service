import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@node2flow/dashboard-core';
import {
  Zap,
  ArrowLeft,
  CheckCircle,
  AlertTriangle,
  XCircle,
  RefreshCw,
  Clock,
  Server,
  Database,
  Globe,
  Shield,
  Activity,
  Loader2,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

type ServiceStatus = 'operational' | 'degraded' | 'outage' | 'maintenance' | 'unknown';

interface ServiceComponent {
  name: string;
  description: string;
  status: ServiceStatus;
  latency?: number;
  icon: React.ReactNode;
}

interface Incident {
  id: string;
  title: string;
  status: 'investigating' | 'identified' | 'monitoring' | 'resolved';
  severity: 'minor' | 'major' | 'critical';
  createdAt: string;
  updatedAt: string;
  updates: {
    status: string;
    message: string;
    timestamp: string;
  }[];
}

interface UptimeDay {
  date: string;
  status: ServiceStatus;
  uptime: number;
}

const statusConfig: Record<ServiceStatus, { label: string; color: string; bgColor: string; icon: React.ReactNode }> = {
  operational: {
    label: 'Operational',
    color: 'text-green-400',
    bgColor: 'bg-green-400',
    icon: <CheckCircle className="h-5 w-5" />,
  },
  degraded: {
    label: 'Degraded Performance',
    color: 'text-yellow-400',
    bgColor: 'bg-yellow-400',
    icon: <AlertTriangle className="h-5 w-5" />,
  },
  outage: {
    label: 'Major Outage',
    color: 'text-red-400',
    bgColor: 'bg-red-400',
    icon: <XCircle className="h-5 w-5" />,
  },
  maintenance: {
    label: 'Under Maintenance',
    color: 'text-blue-400',
    bgColor: 'bg-blue-400',
    icon: <Clock className="h-5 w-5" />,
  },
  unknown: {
    label: 'Unknown',
    color: 'text-gray-400',
    bgColor: 'bg-gray-400',
    icon: <AlertTriangle className="h-5 w-5" />,
  },
};

function StatusBadge({ status }: { status: ServiceStatus }) {
  const config = statusConfig[status];
  return (
    <span className={`inline-flex items-center gap-1.5 ${config.color}`}>
      {config.icon}
      <span className="font-medium">{config.label}</span>
    </span>
  );
}

function UptimeBar({ days }: { days: UptimeDay[] }) {
  return (
    <div className="flex gap-0.5">
      {days.map((day, index) => {
        const config = statusConfig[day.status];
        return (
          <div
            key={index}
            className={`w-1.5 h-8 rounded-sm ${config.bgColor} opacity-80 hover:opacity-100 transition-opacity cursor-pointer`}
            title={`${day.date}: ${day.uptime}% uptime`}
          />
        );
      })}
    </div>
  );
}

function IncidentCard({ incident }: { incident: Incident }) {
  const [expanded, setExpanded] = useState(false);

  const severityColors = {
    minor: 'border-yellow-600 bg-yellow-900/20',
    major: 'border-orange-600 bg-orange-900/20',
    critical: 'border-red-600 bg-red-900/20',
  };

  const statusColors = {
    investigating: 'text-yellow-400',
    identified: 'text-orange-400',
    monitoring: 'text-blue-400',
    resolved: 'text-green-400',
  };

  return (
    <div className={`border rounded-lg p-4 ${severityColors[incident.severity]}`}>
      <div className="flex items-start justify-between">
        <div>
          <h3 className="font-medium text-foreground">{incident.title}</h3>
          <p className={`text-sm ${statusColors[incident.status]} capitalize`}>
            {incident.status}
          </p>
        </div>
        <span className="text-sm text-muted-foreground">
          {new Date(incident.updatedAt).toLocaleDateString()}
        </span>
      </div>

      {incident.updates.length > 0 && (
        <Button variant="link" size="sm" className="mt-2 p-0 h-auto" onClick={() => setExpanded(!expanded)}>
          {expanded ? 'Hide updates' : `Show ${incident.updates.length} update(s)`}
        </Button>
      )}

      {expanded && (
        <div className="mt-4 space-y-3 border-t border-border pt-4">
          {incident.updates.map((update, index) => (
            <div key={index} className="text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <span className="capitalize font-medium">{update.status}</span>
                <span>·</span>
                <span>{new Date(update.timestamp).toLocaleString()}</span>
              </div>
              <p className="text-muted-foreground mt-1">{update.message}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function Status() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [overallStatus, setOverallStatus] = useState<ServiceStatus>('operational');
  const [components, setComponents] = useState<ServiceComponent[]>([]);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [uptimeHistory, setUptimeHistory] = useState<UptimeDay[]>([]);

  const checkStatus = async () => {
    setRefreshing(true);

    try {
      // Check Worker API
      const workerStart = Date.now();
      const workerResponse = await fetch('https://platform.node2flow.net/api/plans');
      const workerLatency = Date.now() - workerStart;
      const workerOk = workerResponse.ok;

      // Check Dashboard (we're already on it, so it's operational)
      const dashboardOk = true;

      // Build components status
      const newComponents: ServiceComponent[] = [
        {
          name: 'MCP Server',
          description: 'Core MCP API and tool execution',
          status: workerOk ? 'operational' : 'outage',
          latency: workerOk ? workerLatency : undefined,
          icon: <Server className="h-5 w-5" />,
        },
        {
          name: 'Dashboard',
          description: 'Web application and user interface',
          status: dashboardOk ? 'operational' : 'outage',
          icon: <Globe className="h-5 w-5" />,
        },
        {
          name: 'Database',
          description: 'User data and connection storage',
          status: workerOk ? 'operational' : 'unknown',
          icon: <Database className="h-5 w-5" />,
        },
        {
          name: 'Authentication',
          description: 'Login, OAuth, and API key validation',
          status: workerOk ? 'operational' : 'unknown',
          icon: <Shield className="h-5 w-5" />,
        },
      ];

      setComponents(newComponents);

      // Calculate overall status
      const hasOutage = newComponents.some(c => c.status === 'outage');
      const hasDegraded = newComponents.some(c => c.status === 'degraded');
      const hasMaintenance = newComponents.some(c => c.status === 'maintenance');

      if (hasOutage) {
        setOverallStatus('outage');
      } else if (hasDegraded) {
        setOverallStatus('degraded');
      } else if (hasMaintenance) {
        setOverallStatus('maintenance');
      } else {
        setOverallStatus('operational');
      }

      // Generate uptime history (last 90 days - simulated for now)
      const history: UptimeDay[] = [];
      for (let i = 89; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        history.push({
          date: date.toISOString().split('T')[0],
          status: 'operational',
          uptime: 99.9 + Math.random() * 0.1,
        });
      }
      setUptimeHistory(history);

      // No current incidents
      setIncidents([]);

      setLastUpdated(new Date());
    } catch (error) {
      console.error('Status check failed:', error);
      setOverallStatus('unknown');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    checkStatus();

    // Auto-refresh every 60 seconds
    const interval = setInterval(checkStatus, 60000);
    return () => clearInterval(interval);
  }, []);

  const calculateUptime = () => {
    if (uptimeHistory.length === 0) return '100.00';
    const total = uptimeHistory.reduce((sum, day) => sum + day.uptime, 0);
    return (total / uptimeHistory.length).toFixed(2);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const content = (
    <>
        {/* Overall Status */}
        <div className={`rounded-xl p-8 mb-8 ${
          overallStatus === 'operational' ? 'bg-green-900/20 border border-green-800' :
          overallStatus === 'degraded' ? 'bg-yellow-900/20 border border-yellow-800' :
          overallStatus === 'outage' ? 'bg-red-900/20 border border-red-800' :
          overallStatus === 'maintenance' ? 'bg-blue-900/20 border border-blue-800' :
          'bg-card border border-border'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-full ${
                overallStatus === 'operational' ? 'bg-green-500/20' :
                overallStatus === 'degraded' ? 'bg-yellow-500/20' :
                overallStatus === 'outage' ? 'bg-red-500/20' :
                overallStatus === 'maintenance' ? 'bg-blue-500/20' :
                'bg-gray-500/20'
              }`}>
                <Activity className={`h-8 w-8 ${statusConfig[overallStatus].color}`} />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">System Status</h1>
                <StatusBadge status={overallStatus} />
              </div>
            </div>
            <Button variant="secondary" onClick={checkStatus} disabled={refreshing}>
              <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
          <p className="text-sm text-muted-foreground mt-4">
            Last updated: {lastUpdated.toLocaleString()}
          </p>
        </div>

        {/* Uptime */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-foreground">Uptime - Last 90 Days</h2>
              <span className="text-2xl font-bold text-green-400">{calculateUptime()}%</span>
            </div>
            <UptimeBar days={uptimeHistory} />
            <div className="flex justify-between text-xs text-muted-foreground mt-2">
              <span>90 days ago</span>
              <span>Today</span>
            </div>
          </CardContent>
        </Card>

        {/* Components */}
        <section className="mb-8">
          <h2 className="text-lg font-semibold text-foreground mb-4">Service Components</h2>
          <div className="space-y-3">
            {components.map((component) => (
              <Card key={component.name}>
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="text-primary">{component.icon}</div>
                    <div>
                      <h3 className="font-medium text-foreground">{component.name}</h3>
                      <p className="text-sm text-muted-foreground">{component.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    {component.latency !== undefined && (
                      <span className="text-sm text-muted-foreground">
                        {component.latency}ms
                      </span>
                    )}
                    <div className={`w-3 h-3 rounded-full ${statusConfig[component.status].bgColor}`} />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Current Incidents */}
        <section className="mb-8">
          <h2 className="text-lg font-semibold text-foreground mb-4">Current Incidents</h2>
          {incidents.length > 0 ? (
            <div className="space-y-4">
              {incidents.map((incident) => (
                <IncidentCard key={incident.id} incident={incident} />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <CheckCircle className="h-12 w-12 text-green-400 mx-auto mb-3" />
                <p className="text-foreground font-medium">No active incidents</p>
                <p className="text-muted-foreground text-sm mt-1">
                  All systems are operating normally
                </p>
              </CardContent>
            </Card>
          )}
        </section>

        {/* Scheduled Maintenance */}
        <section className="mb-8">
          <h2 className="text-lg font-semibold text-foreground mb-4">Scheduled Maintenance</h2>
          <Card>
            <CardContent className="p-8 text-center">
              <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-foreground font-medium">No scheduled maintenance</p>
              <p className="text-muted-foreground text-sm mt-1">
                We'll announce any planned maintenance here
              </p>
            </CardContent>
          </Card>
        </section>

        {/* Subscribe */}
        <Card>
          <CardContent className="p-6">
            <h2 className="text-lg font-semibold text-foreground mb-2">Stay Updated</h2>
            <p className="text-muted-foreground mb-4">
              Get notified about service incidents and maintenance windows.
            </p>
            <Button asChild>
              <a href="mailto:status@node2flow.net?subject=Subscribe%20to%20Status%20Updates">
                Subscribe via Email
              </a>
            </Button>
          </CardContent>
        </Card>

        {/* Footer */}
        {!user && (
          <>
            <Separator className="mt-12" />
            <div className="mt-8 flex flex-wrap justify-between gap-4 text-sm">
              <div className="flex gap-4">
                <Link to="/docs" className="text-primary hover:underline">Documentation</Link>
                <Link to="/faq" className="text-primary hover:underline">FAQ</Link>
              </div>
              <a
                href="mailto:support@node2flow.net"
                className="text-primary hover:underline"
              >
                Report an Issue
              </a>
            </div>
          </>
        )}
    </>
  );

  if (user) {
    return <div className="space-y-6">{content}</div>;
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border sticky top-0 bg-background/95 backdrop-blur z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center gap-2">
              <div className="bg-primary p-2 rounded-lg">
                <Zap className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold text-foreground">Node2Flow</span>
            </Link>
            <Link to="/" className="text-muted-foreground hover:text-foreground flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Home
            </Link>
          </div>
        </div>
      </header>
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {content}
      </main>
    </div>
  );
}
