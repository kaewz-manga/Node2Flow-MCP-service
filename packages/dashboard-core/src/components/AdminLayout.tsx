import { useState } from 'react';
import type { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  Shield,
  Users,
  BarChart3,
  DollarSign,
  HeartPulse,
  MessageSquare,
  Wrench,
  ArrowLeft,
  LogOut,
  Menu,
} from 'lucide-react';
import { Button } from './ui/button';
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from './ui/tooltip';
import { Sheet, SheetContent, SheetTitle } from './ui/sheet';

const adminNav = [
  { name: 'Overview', href: '/admin', icon: Shield },
  { name: 'Users', href: '/admin/users', icon: Users },
  { name: 'Analytics', href: '/admin/analytics', icon: BarChart3 },
  { name: 'Revenue', href: '/admin/revenue', icon: DollarSign },
  { name: 'System Health', href: '/admin/health', icon: HeartPulse },
  { name: 'Feedback', href: '/admin/feedback', icon: MessageSquare },
  { name: 'System', href: '/admin/system', icon: Wrench },
];

function AdminSidebarContent({ onNavClick }: { onNavClick: () => void }) {
  const { user, logout } = useAuth();
  const location = useLocation();

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 px-6 py-4 border-b border-border">
        <div className="bg-primary p-2 rounded-lg">
          <Shield className="h-5 w-5 text-primary-foreground" />
        </div>
        <span className="font-semibold text-foreground">Admin Panel</span>
      </div>

      <nav className="flex-1 px-4 py-4 space-y-1">
        {adminNav.map((item) => {
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

        <div className="pt-4 mt-4 border-t border-border">
          <Button
            variant="ghost"
            className="w-full justify-start gap-3 text-primary hover:bg-primary/10"
            asChild
          >
            <Link to="/dashboard">
              <ArrowLeft className="h-5 w-5" />
              Back to Dashboard
            </Link>
          </Button>
        </div>
      </nav>

      <div className="p-4 border-t border-border">
        <div className="flex items-center gap-3 px-3 py-2">
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground truncate">{user?.email}</p>
            <p className="text-xs text-primary font-medium">Admin</p>
          </div>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" onClick={logout}>
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

export default function AdminLayout({ children }: { children: ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile sidebar (Sheet) */}
      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <SheetContent side="left" className="w-64 p-0">
          <SheetTitle className="sr-only">Admin Navigation</SheetTitle>
          <AdminSidebarContent onNavClick={() => setSidebarOpen(false)} />
        </SheetContent>
      </Sheet>

      {/* Desktop sidebar */}
      <aside className="fixed top-0 left-0 z-50 h-full w-64 bg-card border-r border-border hidden lg:block">
        <AdminSidebarContent onNavClick={() => {}} />
      </aside>

      <div className="lg:pl-64">
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
                <Shield className="h-4 w-4 text-primary-foreground" />
              </div>
              <span className="font-semibold text-foreground">Admin Panel</span>
            </div>
          </div>
        </header>

        <main className="p-4 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
