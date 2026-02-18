import { useMemo, type ComponentType, type ReactNode } from 'react';
import { Toaster } from './ui/sonner';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  Zap,
  LayoutDashboard,
  Blocks,
  BarChart3,
  Settings,
  LogOut,
  Shield,
  FileText,
  HelpCircle,
  Activity,
  ChevronsUpDown,
  ChevronRight,
} from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from './ui/avatar';
import { Separator } from './ui/separator';
import FeedbackBubble from './FeedbackBubble';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarRail,
  SidebarTrigger,
} from './ui/sidebar';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from './ui/collapsible';
import { TooltipProvider } from './ui/tooltip';

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
  logo?: string;
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

const platformNav = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Services', href: '/services', icon: Blocks },
];

const secondaryNav = [
  { name: 'Settings', href: '/settings', icon: Settings },
  { name: 'Documentation', href: '/docs', icon: FileText },
  { name: 'FAQ', href: '/faq', icon: HelpCircle },
  { name: 'Status', href: '/status', icon: Activity },
];

const dropdownSupportNav = [
  { name: 'Documentation', href: '/docs', icon: FileText },
  { name: 'FAQ', href: '/faq', icon: HelpCircle },
  { name: 'Status', href: '/status', icon: Activity },
];

function getPageTitle(pathname: string, plugins: DashboardPlugin[]): string {
  for (const nav of platformNav) {
    if (pathname === nav.href) return nav.name;
  }
  for (const nav of secondaryNav) {
    if (pathname === nav.href) return nav.name;
  }
  if (pathname === '/usage') return 'Usage';
  if (pathname === '/admin') return 'Admin Overview';
  if (pathname === '/admin/users') return 'Admin Users';
  if (pathname === '/admin/analytics') return 'Admin Analytics';
  if (pathname === '/admin/revenue') return 'Admin Revenue';
  if (pathname === '/admin/health') return 'Admin Health';
  if (pathname === '/admin/feedback') return 'Admin Feedback';
  if (pathname === '/admin/system') return 'Admin System';
  if (pathname.startsWith('/admin')) return 'Admin';
  for (const plugin of plugins) {
    const pluginHref = plugin.sidebarItems[0]?.href || `/${plugin.id}`;
    if (pathname === pluginHref || pathname.startsWith(pluginHref + '/') || pathname.startsWith(`/${plugin.id}`)) {
      return plugin.name;
    }
  }
  return 'Node2Flow';
}

function AppSidebar({ plugins }: { plugins: DashboardPlugin[] }) {
  const location = useLocation();
  const { user, logout, isAdmin } = useAuth();
  const initials = user?.email ? user.email.slice(0, 2).toUpperCase() : 'U';
  const avatarUrl = user?.avatar_url || undefined;

  const isOnServicePage = useMemo(() => {
    return plugins.some((plugin) => {
      const href = plugin.sidebarItems[0]?.href || `/${plugin.id}`;
      return location.pathname === href
        || location.pathname.startsWith(href + '/')
        || location.pathname.startsWith(`/${plugin.id}`);
    });
  }, [location.pathname, plugins]);

  return (
    <Sidebar variant="inset" collapsible="icon">
      {/* Header — Logo */}
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" tooltip="Node2Flow" asChild>
              <Link to="/dashboard">
                <div className="bg-primary rounded-lg flex aspect-square size-8 items-center justify-center">
                  <Zap className="size-4 text-primary-foreground" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">Node2Flow</span>
                  <span className="truncate text-xs text-muted-foreground">MCP Platform</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        {/* Platform Nav */}
        <SidebarGroup>
          <SidebarGroupLabel>Platform</SidebarGroupLabel>
          <SidebarMenu>
            {platformNav.map((item) => (
              <SidebarMenuItem key={item.name}>
                <SidebarMenuButton
                  tooltip={item.name}
                  isActive={location.pathname === item.href}
                  asChild
                >
                  <Link to={item.href}>
                    <item.icon />
                    <span>{item.name}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>

        {/* Plugin Services — collapsible */}
        <Collapsible defaultOpen={isOnServicePage} className="group/collapsible">
          <SidebarGroup>
            <SidebarGroupLabel asChild>
              <CollapsibleTrigger>
                Services
                <ChevronRight className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-90" />
              </CollapsibleTrigger>
            </SidebarGroupLabel>
            <CollapsibleContent>
              <SidebarGroupContent>
                <SidebarMenu>
                  {plugins.map((plugin) => {
                    const pluginHref = plugin.sidebarItems[0]?.href || `/${plugin.id}`;
                    const isPluginActive = location.pathname === pluginHref
                      || location.pathname.startsWith(pluginHref + '/')
                      || location.pathname.startsWith(`/${plugin.id}`);
                    return (
                      <SidebarMenuItem key={plugin.id}>
                        <SidebarMenuButton
                          tooltip={plugin.name}
                          isActive={isPluginActive}
                          asChild
                        >
                          <Link to={pluginHref}>
                            {plugin.logo ? (
                              <img src={plugin.logo} alt={plugin.name} className="h-4 w-4 shrink-0" />
                            ) : (
                              <plugin.icon />
                            )}
                            <span>{plugin.name}</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    );
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </CollapsibleContent>
          </SidebarGroup>
        </Collapsible>

      </SidebarContent>

      {/* Footer — User Avatar + Dropdown */}
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  size="lg"
                  className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                >
                  <Avatar className="h-8 w-8 rounded-lg">
                    {avatarUrl && <AvatarImage src={avatarUrl} alt={user?.email || ''} />}
                    <AvatarFallback className="rounded-lg bg-muted text-xs">{initials}</AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-medium">{user?.email}</span>
                    <span className="truncate text-xs text-muted-foreground capitalize">{user?.plan} plan</span>
                  </div>
                  <ChevronsUpDown className="ml-auto size-4" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
                side="bottom"
                align="end"
                sideOffset={4}
              >
                <DropdownMenuLabel className="p-0 font-normal">
                  <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                    <Avatar className="h-8 w-8 rounded-lg">
                      {avatarUrl && <AvatarImage src={avatarUrl} alt={user?.email || ''} />}
                      <AvatarFallback className="rounded-lg bg-muted text-xs">{initials}</AvatarFallback>
                    </Avatar>
                    <div className="grid flex-1 text-left text-sm leading-tight">
                      <span className="truncate font-medium">{user?.email}</span>
                      <span className="truncate text-xs text-muted-foreground capitalize">{user?.plan} plan</span>
                    </div>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <DropdownMenuItem asChild>
                    <Link to="/usage">
                      <BarChart3 className="mr-2 h-4 w-4" />
                      Usage
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/settings">
                      <Settings className="mr-2 h-4 w-4" />
                      Settings
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  {dropdownSupportNav.map((item) => (
                    <DropdownMenuItem key={item.name} asChild>
                      <Link to={item.href}>
                        <item.icon className="mr-2 h-4 w-4" />
                        {item.name}
                      </Link>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuGroup>
                {isAdmin && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link to="/admin" className="text-red-400">
                        <Shield className="mr-2 h-4 w-4" />
                        Admin Panel
                      </Link>
                    </DropdownMenuItem>
                  </>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}

function SiteHeader({ plugins }: { plugins: DashboardPlugin[] }) {
  const location = useLocation();
  const pageTitle = getPageTitle(location.pathname, plugins);

  return (
    <header className="flex h-12 shrink-0 items-center gap-2 border-b border-border transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mx-2 data-[orientation=vertical]:h-4" />
        <h1 className="text-base font-medium text-muted-foreground">{pageTitle}</h1>
      </div>
    </header>
  );
}

export default function Layout({ children, plugins = [] }: LayoutProps) {
  return (
    <TooltipProvider delayDuration={0}>
      <SidebarProvider
        style={
          {
            '--sidebar-width': '18rem',
            '--header-height': '3rem',
          } as React.CSSProperties
        }
      >
        <AppSidebar plugins={plugins} />
        <SidebarInset>
          <SiteHeader plugins={plugins} />
          <div className="flex flex-1 flex-col">
            {children}
          </div>
        </SidebarInset>
      </SidebarProvider>
      <FeedbackBubble />
      <Toaster />
    </TooltipProvider>
  );
}
