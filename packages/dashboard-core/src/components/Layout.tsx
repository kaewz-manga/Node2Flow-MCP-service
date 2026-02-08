import type { ComponentType, ReactNode } from 'react';
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
  ChevronsUpDown,
  User,
} from 'lucide-react';
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
                        <plugin.icon />
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

        {/* Resources */}
        <SidebarGroup>
          <SidebarGroupLabel>Resources</SidebarGroupLabel>
          <SidebarMenu>
            {resourceNavigation.map((item) => (
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

        {/* Admin */}
        {isAdmin && (
          <SidebarGroup>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  tooltip="Admin Panel"
                  isActive={location.pathname.startsWith('/admin')}
                  className="text-red-400 hover:text-red-400 hover:bg-red-900/30"
                  asChild
                >
                  <Link to="/admin">
                    <Shield />
                    <span>Admin Panel</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroup>
        )}
      </SidebarContent>

      {/* Footer — User */}
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  size="lg"
                  className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                >
                  <div className="bg-sidebar-accent rounded-lg flex aspect-square size-8 items-center justify-center">
                    <User className="size-4" />
                  </div>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-medium">{user?.email}</span>
                    <span className="truncate text-xs capitalize">{user?.plan} plan</span>
                  </div>
                  <ChevronsUpDown className="ml-auto size-4" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-[--radix-dropdown-menu-trigger-width] min-w-56"
                side="bottom"
                align="end"
                sideOffset={4}
              >
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{user?.email}</p>
                    <p className="text-xs leading-none text-muted-foreground capitalize">{user?.plan} plan</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <DropdownMenuItem asChild>
                    <Link to="/settings">
                      <Settings className="mr-2 h-4 w-4" />
                      Settings
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/usage">
                      <BarChart3 className="mr-2 h-4 w-4" />
                      Usage
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuGroup>
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

export default function Layout({ children, plugins = [] }: LayoutProps) {
  return (
    <TooltipProvider delayDuration={0}>
      <SidebarProvider>
        <AppSidebar plugins={plugins} />
        <SidebarInset>
          <header className="flex h-12 shrink-0 items-center gap-2 border-b border-border transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
            <div className="flex items-center gap-2 px-4">
              <SidebarTrigger className="-ml-1" />
            </div>
          </header>
          <div className="flex-1 p-4 lg:p-8">
            {children}
          </div>
        </SidebarInset>
      </SidebarProvider>
      <FeedbackBubble />
    </TooltipProvider>
  );
}
