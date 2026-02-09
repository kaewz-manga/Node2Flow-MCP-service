import type { ComponentType, ReactNode } from 'react';
import { Toaster } from './ui/sonner';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useConnection } from '../contexts/ConnectionContext';
import {
  Zap,
  LayoutDashboard,
  BarChart3,
  Settings,
  LogOut,
  Shield,
  ChevronRight,
  FileText,
  HelpCircle,
  Activity,
} from 'lucide-react';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Button } from './ui/button';
import FeedbackBubble from './FeedbackBubble';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from './ui/select';
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from './ui/collapsible';
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
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarProvider,
  SidebarRail,
  SidebarTrigger,
} from './ui/sidebar';
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

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
];

function AppSidebar({ plugins }: { plugins: DashboardPlugin[] }) {
  const { user, logout, isAdmin } = useAuth();
  const { connections, activeConnection, setActiveConnectionId } = useConnection();
  const location = useLocation();

  return (
    <Sidebar collapsible="icon">
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
            {navigation.map((item) => (
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

        {/* Plugin Sections — collapsible dropdowns */}
        <SidebarGroup>
          <SidebarGroupLabel>Services</SidebarGroupLabel>
          <SidebarMenu>
            {plugins.map((plugin) => {
              const isPluginActive = plugin.sidebarItems.some(item =>
                location.pathname.startsWith(item.href)
              );
              return (
                <Collapsible
                  key={plugin.id}
                  asChild
                  defaultOpen={isPluginActive}
                  className="group/collapsible"
                >
                  <SidebarMenuItem>
                    <CollapsibleTrigger asChild>
                      <SidebarMenuButton tooltip={plugin.name} isActive={isPluginActive}>
                        {plugin.logo ? (
                          <img src={plugin.logo} alt={plugin.name} className="h-4 w-4 shrink-0" />
                        ) : (
                          <plugin.icon />
                        )}
                        <span>{plugin.name}</span>
                        <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                      </SidebarMenuButton>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <SidebarMenuSub>
                        {/* Connection selector */}
                        {plugin.requiresConnection && connections.filter(c => c.product_type === plugin.id).length > 0 && (
                          <li className="px-1 py-1">
                            <Select
                              value={activeConnection?.id || ''}
                              onValueChange={(val) => setActiveConnectionId(val)}
                            >
                              <SelectTrigger className="h-6 text-xs">
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
                          </li>
                        )}
                        {plugin.sidebarItems.map((item) => (
                          <SidebarMenuSubItem key={item.name}>
                            <SidebarMenuSubButton
                              isActive={location.pathname.startsWith(item.href)}
                              asChild
                            >
                              <Link to={item.href}>
                                <item.icon />
                                <span>{item.name}</span>
                              </Link>
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                        ))}
                      </SidebarMenuSub>
                    </CollapsibleContent>
                  </SidebarMenuItem>
                </Collapsible>
              );
            })}
          </SidebarMenu>
        </SidebarGroup>

      </SidebarContent>

      <SidebarFooter />

      <SidebarRail />
    </Sidebar>
  );
}

function HeaderBar({ plugins: _plugins }: { plugins: DashboardPlugin[] }) {
  const { user, logout, isAdmin } = useAuth();
  const initials = user?.email ? user.email.slice(0, 2).toUpperCase() : 'U';

  return (
    <header className="flex h-12 shrink-0 items-center justify-between border-b border-border transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
      <div className="flex items-center gap-2 px-4">
        <SidebarTrigger className="-ml-1" />
      </div>
      <div className="flex items-center gap-2 px-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-full">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-sidebar-accent text-xs">{initials}</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="min-w-56">
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">{user?.email}</p>
                <p className="text-xs leading-none text-muted-foreground capitalize">{user?.plan} plan</p>
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
              <DropdownMenuItem asChild>
                <Link to="/docs">
                  <FileText className="mr-2 h-4 w-4" />
                  Documentation
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/faq">
                  <HelpCircle className="mr-2 h-4 w-4" />
                  FAQ
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/status">
                  <Activity className="mr-2 h-4 w-4" />
                  Status
                </Link>
              </DropdownMenuItem>
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
      </div>
    </header>
  );
}

export default function Layout({ children, plugins = [] }: LayoutProps) {
  return (
    <TooltipProvider delayDuration={0}>
      <SidebarProvider>
        <AppSidebar plugins={plugins} />
        <SidebarInset>
          <HeaderBar plugins={plugins} />
          <div className="flex-1 p-4 lg:p-8">
            {children}
          </div>
        </SidebarInset>
      </SidebarProvider>
      <FeedbackBubble />
      <Toaster />
    </TooltipProvider>
  );
}
