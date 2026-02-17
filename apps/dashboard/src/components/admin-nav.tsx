import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';

const adminTabs = [
  { name: 'Overview', href: '/admin' },
  { name: 'Users', href: '/admin/users' },
  { name: 'Analytics', href: '/admin/analytics' },
  { name: 'Revenue', href: '/admin/revenue' },
  { name: 'Health', href: '/admin/health' },
  { name: 'Feedback', href: '/admin/feedback' },
  { name: 'System', href: '/admin/system' },
];

export function AdminNav() {
  const location = useLocation();

  return (
    <nav className="flex gap-1 overflow-x-auto border-b border-border pb-px">
      {adminTabs.map((tab) => (
        <Link
          key={tab.href}
          to={tab.href}
          className={cn(
            'px-3 py-2 text-sm font-medium whitespace-nowrap rounded-t-md transition-colors',
            location.pathname === tab.href
              ? 'text-foreground border-b-2 border-primary'
              : 'text-muted-foreground hover:text-foreground'
          )}
        >
          {tab.name}
        </Link>
      ))}
    </nav>
  );
}
