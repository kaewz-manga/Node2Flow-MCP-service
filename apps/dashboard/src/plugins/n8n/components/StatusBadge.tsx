import { Badge } from '@node2flow/dashboard-core';


const colors: Record<string, string> = {
  active: 'bg-emerald-900/30 text-emerald-400',
  inactive: 'bg-muted text-foreground',
  success: 'bg-emerald-900/30 text-emerald-400',
  error: 'bg-red-900/30 text-red-400',
  pending: 'bg-amber-900/30 text-amber-400',
  waiting: 'bg-amber-900/30 text-amber-400',
  running: 'bg-primary/10 text-primary',
  new: 'bg-primary/10 text-primary',
  crashed: 'bg-red-900/30 text-red-400',
};

export default function StatusBadge({ status }: { status: string }) {
  const cls = colors[status?.toLowerCase()] || 'bg-muted text-foreground';
  return (
    <Badge variant="secondary" className={cls}>
      {status}
    </Badge>
  );
}
