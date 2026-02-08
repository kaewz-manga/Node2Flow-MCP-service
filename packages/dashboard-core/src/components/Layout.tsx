import { useState, type ComponentType } from 'react';
import type { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useConnection } from '../contexts/ConnectionContext';
import {
  Zap,
  LayoutDashboard,
  BarChart3,
  Settings,
  LogOut,
  Menu,
  X,
  Shield,
  ChevronDown,
  FileText,
  HelpCircle,
  Activity,
} from 'lucide-react';
import FeedbackBubble from './FeedbackBubble';
import { Button } from './ui/button';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from './ui/select';
import { Separator } from './ui/separator';
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from './ui/tooltip';
import { Sheet, SheetContent, SheetTitle } from './ui/sheet';

// ============================================
// Plugin Types (shared with apps/dashboard)
// ============================================

export interface SidebarItem {
  name: string;
  href: string;
  icon: ComponentType<{ className?: string }>;
}

export interface DashboardPlugin {
  id: string;
  name: string;
  icon: ComponentType<{ className?: string }>;
  sidebarItems: SidebarItem[];
  requiresConnection: boolean;
}

// ============================================
// Layout Component
// ============================================

interface LayoutProps {
  children: ReactNode;
  plugins?: DashboardPlugin[];
}

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Usage', href: '/usage', icon: BarChart3 },
  { name: 'Settings', href: '/settings', icon: Settings },
];

const resourceNavigation = [
  { name: 'Documentation', href: '/docs', icon: FileText },
  { name: 'FAQ', href: '/faq', icon: HelpCircle },
  { name: 'Status', href: '/status', icon: Activity },
];

function SidebarContent({
  plugins,
  expandedPlugins,
  togglePlugin,
  onNavClick,
}: {
  plugins: DashboardPlugin[];
  expandedPlugins: Record<string, boolean>;
  togglePlugin: (id: string) => void;
  onNavClick: () => void;
}) {
  const { user, logout, isAdmin } = useAuth();
  const { connections, activeConnection, setActiveConnectionId } = useConnection();
  const location = useLocation();

  return (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center gap-2 px-6 py-4 border-b border-border">
        <div className="bg-primary p-2 rounded-lg">
          <Zap className="h-5 w-5 text-primary-foreground" />
        </div>
        <span className="font-semibold text-foreground">Node2Flow</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
        {navigation.map((item) => {
          const isActive = location.pathname === item.href;
          return (
            <Button
              key={item.name}
              variant={isActive ? 'secondary' : 'ghost'}
              className={`w-full justify-start gap-3 ${isActive ? 'bg-primary/10 text-primary hover:bg-primary/15' : ''}`}
              asChild
            >
              <Link to={item.href} onClick={onNavClick}>
                <item.icon className="h-5 w-5" />
                {item.name}
              </Link>
            </Button>
          );
        })}

        {/* Dynamic Plugin Sections */}
        {plugins.map((plugin) => (
          <div key={plugin.id} className="pt-4 mt-4 border-t border-border">
            <Button
              variant="ghost"
              onClick={() => togglePlugin(plugin.id)}
              className="w-full justify-start gap-3"
            >
              <plugin.icon className="h-5 w-5" />
              <span className="flex-1 text-left">{plugin.name}</span>
              <ChevronDown className={`h-4 w-4 transition-transform ${expandedPlugins[plugin.id] ? 'rotate-180' : ''}`} />
            </Button>
            {expandedPlugins[plugin.id] && (
              <div className="mt-1 space-y-0.5">
                {/* Connection selector for plugins that need it */}
                {plugin.requiresConnection && connections.length > 0 && (
                  <div className="px-3 py-1.5">
                    <Select
                      value={activeConnection?.id || ''}
                      onValueChange={(val) => setActiveConnectionId(val)}
                    >
                      <SelectTrigger className="h-8 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {connections
                          .filter(c => c.product_type === plugin.id)
                          .map((c) => (
                            <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
                {plugin.sidebarItems.map((item) => {
                  const isActive = location.pathname.startsWith(item.href);
                  return (
                    <Button
                      key={item.name}
                      variant={isActive ? 'secondary' : 'ghost'}
                      size="sm"
                      className={`w-full justify-start gap-3 ml-2 ${isActive ? 'bg-primary/10 text-primary hover:bg-primary/15' : ''}`}
                      asChild
                    >
                      <Link to={item.href} onClick={onNavClick}>
                        <item.icon className="h-4 w-4" />
                        {item.name}
                      </Link>
                    </Button>
                  );
                })}
              </div>
            )}
          </div>
        ))}

        {/* Resources */}
        <div className="pt-4 mt-4 border-t border-border">
          <p className="px-3 mb-1 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Resources</p>
          {resourceNavigation.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Button
                key={item.name}
                variant={isActive ? 'secondary' : 'ghost'}
                className={`w-full justify-start gap-3 ${isActive ? 'bg-primary/10 text-primary hover:bg-primary/15' : ''}`}
                asChild
              >
                <Link to={item.href} onClick={onNavClick}>
                  <item.icon className="h-5 w-5" />
                  {item.name}
                </Link>
              </Button>
            );
          })}
        </div>

        {/* Admin Panel */}
        {isAdmin && (
          <div className="pt-4 mt-4 border-t border-border">
            <Button
              variant="ghost"
              className="w-full justify-start gap-3 text-red-400 hover:bg-red-900/30 hover:text-red-400"
              asChild
            >
              <Link to="/admin" onClick={onNavClick}>
                <Shield className="h-5 w-5" />
                Admin Panel
              </Link>
            </Button>
          </div>
        )}
      </nav>

      {/* User section */}
      <div className="p-4 border-t border-border">
        <div className="flex items-center gap-3 px-3 py-2">
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground truncate">
              {user?.email}
            </p>
            <p className="text-xs text-muted-foreground capitalize">
              {user?.plan} plan
            </p>
          </div>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={logout}
                >
                  <LogOut className="h-5 w-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Sign out</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>
    </div>
  );
}

export default function Layout({ children, plugins = [] }: LayoutProps) {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [expandedPlugins, setExpandedPlugins] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    for (const plugin of plugins) {
      if (plugin.sidebarItems.some(item => location.pathname.startsWith(item.href.split('/').slice(0, 3).join('/')))) {
        initial[plugin.id] = true;
      }
    }
    return initial;
  });

  const togglePlugin = (pluginId: string) => {
    setExpandedPlugins(prev => ({ ...prev, [pluginId]: !prev[pluginId] }));
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile sidebar (Sheet) */}
      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <SheetContent side="left" className="w-64 p-0">
          <SheetTitle className="sr-only">Navigation</SheetTitle>
          <SidebarContent
            plugins={plugins}
            expandedPlugins={expandedPlugins}
            togglePlugin={togglePlugin}
            onNavClick={() => setSidebarOpen(false)}
          />
        </SheetContent>
      </Sheet>

      {/* Desktop sidebar */}
      <aside className="fixed top-0 left-0 z-50 h-full w-64 bg-card border-r border-border hidden lg:block">
        <SidebarContent
          plugins={plugins}
          expandedPlugins={expandedPlugins}
          togglePlugin={togglePlugin}
          onNavClick={() => {}}
        />
      </aside>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Mobile header */}
        <header className="sticky top-0 z-30 bg-card border-b border-border lg:hidden">
          <div className="flex items-center gap-4 px-4 py-3">
            <Button
              variant="ghost"
              size="icon"
              className="-ml-2"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="h-6 w-6" />
            </Button>
            <div className="flex items-center gap-2">
              <div className="bg-primary p-1.5 rounded-lg">
                <Zap className="h-4 w-4 text-primary-foreground" />
              </div>
              <span className="font-semibold text-foreground">Node2Flow</span>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="p-4 lg:p-8">{children}</main>
      </div>

      {/* Feedback bubble */}
      <FeedbackBubble />
    </div>
  );
}
