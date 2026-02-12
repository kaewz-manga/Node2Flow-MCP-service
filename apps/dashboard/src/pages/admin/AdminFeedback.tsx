import { useEffect, useState, useMemo } from 'react';
import {
  getAdminFeedback,
  updateAdminFeedback,
  type AdminFeedbackItem,
} from '../../lib/platform-api';
import { Button, Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter, Table, TableHeader, TableBody, TableRow, TableHead, TableCell, Badge, Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, Label, Textarea, Select, SelectTrigger, SelectValue, SelectContent, SelectItem, Separator } from '@node2flow/dashboard-core';
import { toast } from 'sonner';
import {
  Loader2,
  ChevronLeft,
  ChevronRight,
  Bug,
  Lightbulb,
  MessageSquare,
  HelpCircle,
  Inbox,
  CheckCircle,
  Eye,
} from 'lucide-react';








const categoryConfig: Record<string, { label: string; icon: typeof Bug; color: string; badgeClass: string }> = {
  bug: { label: 'Bug', icon: Bug, color: 'text-red-400', badgeClass: 'bg-red-500/10 text-red-400' },
  feature: { label: 'Feature', icon: Lightbulb, color: 'text-amber-400', badgeClass: 'bg-amber-500/10 text-amber-400' },
  general: { label: 'General', icon: MessageSquare, color: 'text-blue-400', badgeClass: 'bg-blue-500/10 text-blue-400' },
  question: { label: 'Question', icon: HelpCircle, color: 'text-purple-400', badgeClass: 'bg-purple-500/10 text-purple-400' },
};

const statusConfig: Record<string, { label: string; badgeClass: string }> = {
  new: { label: 'New', badgeClass: 'bg-blue-500/10 text-blue-400' },
  reviewed: { label: 'Reviewed', badgeClass: 'bg-yellow-500/10 text-yellow-400' },
  resolved: { label: 'Resolved', badgeClass: 'bg-green-500/10 text-green-400' },
  archived: { label: 'Archived', badgeClass: 'bg-muted-foreground/10 text-muted-foreground' },
};

export default function AdminFeedback() {
  const [feedback, setFeedback] = useState<AdminFeedbackItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [offset, setOffset] = useState(0);
  const limit = 20;

  // Detail modal
  const [selected, setSelected] = useState<AdminFeedbackItem | null>(null);
  const [editStatus, setEditStatus] = useState('');
  const [editNotes, setEditNotes] = useState('');
  const [saving, setSaving] = useState(false);

  async function fetchFeedback() {
    setLoading(true);
    setError('');
    const res = await getAdminFeedback({
      limit,
      offset,
      status: statusFilter || undefined,
      category: categoryFilter || undefined,
    });
    if (res.success && res.data) {
      setFeedback(res.data.feedback);
      setTotal(res.data.total);
    } else {
      setError(res.error?.message || 'Failed to load feedback');
    }
    setLoading(false);
  }

  useEffect(() => { fetchFeedback(); }, [offset, statusFilter, categoryFilter]);

  function openDetail(item: AdminFeedbackItem) {
    setSelected(item);
    setEditStatus(item.status);
    setEditNotes(item.admin_notes || '');
  }

  async function handleSave() {
    if (!selected) return;
    setSaving(true);
    const res = await updateAdminFeedback(selected.id, {
      status: editStatus,
      admin_notes: editNotes || undefined,
    });
    setSaving(false);
    if (res.success) {
      setSelected(null);
      fetchFeedback();
    } else {
      toast.error(res.error?.message || 'Failed to update');
    }
  }

  const totalPages = Math.ceil(total / limit);
  const currentPage = Math.floor(offset / limit) + 1;

  // Compute stat summaries
  const stats = useMemo(() => {
    const newCount = feedback.filter(f => f.status === 'new').length;
    const reviewedCount = feedback.filter(f => f.status === 'reviewed').length;
    const resolvedCount = feedback.filter(f => f.status === 'resolved').length;
    const bugCount = feedback.filter(f => f.category === 'bug').length;
    const featureCount = feedback.filter(f => f.category === 'feature').length;
    return { newCount, reviewedCount, resolvedCount, bugCount, featureCount };
  }, [feedback]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Feedback</h1>
        <p className="text-muted-foreground mt-1">User feedback and suggestions</p>
      </div>
      <Separator />

      {/* Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-t from-primary/5 to-card shadow-sm">
          <CardHeader className="pb-2">
            <CardDescription>Total Feedback</CardDescription>
            <CardTitle className="text-2xl font-semibold tabular-nums">{total}</CardTitle>
          </CardHeader>
          <CardFooter className="text-sm text-muted-foreground">
            <Inbox className="h-3.5 w-3.5 mr-1.5 text-primary" />
            All submissions
          </CardFooter>
        </Card>

        <Card className="bg-gradient-to-t from-blue-500/5 to-card shadow-sm">
          <CardHeader className="pb-2">
            <CardDescription>New</CardDescription>
            <CardTitle className="text-2xl font-semibold tabular-nums text-blue-400">{stats.newCount}</CardTitle>
          </CardHeader>
          <CardFooter className="text-sm text-muted-foreground">
            <Eye className="h-3.5 w-3.5 mr-1.5 text-blue-400" />
            Awaiting review
          </CardFooter>
        </Card>

        <Card className="bg-gradient-to-t from-red-500/5 to-card shadow-sm">
          <CardHeader className="pb-2">
            <CardDescription>Bug Reports</CardDescription>
            <CardTitle className="text-2xl font-semibold tabular-nums text-red-400">{stats.bugCount}</CardTitle>
          </CardHeader>
          <CardFooter className="text-sm text-muted-foreground">
            <Bug className="h-3.5 w-3.5 mr-1.5 text-red-400" />
            Issues reported
          </CardFooter>
        </Card>

        <Card className="bg-gradient-to-t from-primary/5 to-card shadow-sm">
          <CardHeader className="pb-2">
            <CardDescription>Resolved</CardDescription>
            <CardTitle className="text-2xl font-semibold tabular-nums text-primary">{stats.resolvedCount}</CardTitle>
          </CardHeader>
          <CardFooter className="text-sm text-muted-foreground">
            <CheckCircle className="h-3.5 w-3.5 mr-1.5 text-primary" />
            Completed
          </CardFooter>
        </Card>
      </div>

      {/* Category Breakdown */}
      {feedback.length > 0 && (
        <Card className="shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-6 text-sm">
              <span className="text-muted-foreground font-medium">Categories:</span>
              {Object.entries(categoryConfig).map(([key, config]) => {
                const count = feedback.filter(f => f.category === key).length;
                if (count === 0) return null;
                const Icon = config.icon;
                return (
                  <span key={key} className="flex items-center gap-1.5">
                    <Icon className={`h-3.5 w-3.5 ${config.color}`} />
                    <span className="text-muted-foreground">{config.label}</span>
                    <span className="font-medium text-foreground">{count}</span>
                  </span>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <Select value={statusFilter || 'all'} onValueChange={(value) => { setStatusFilter(value === 'all' ? '' : value); setOffset(0); }}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="All Statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="new">New</SelectItem>
            <SelectItem value="reviewed">Reviewed</SelectItem>
            <SelectItem value="resolved">Resolved</SelectItem>
            <SelectItem value="archived">Archived</SelectItem>
          </SelectContent>
        </Select>
        <Select value={categoryFilter || 'all'} onValueChange={(value) => { setCategoryFilter(value === 'all' ? '' : value); setOffset(0); }}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            <SelectItem value="bug">Bug Report</SelectItem>
            <SelectItem value="feature">Feature Request</SelectItem>
            <SelectItem value="general">General</SelectItem>
            <SelectItem value="question">Question</SelectItem>
          </SelectContent>
        </Select>
        <span className="px-3 py-2 text-sm text-muted-foreground">
          {total} total
        </span>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
          <p className="text-red-400">{error}</p>
        </div>
      )}

      {/* Table */}
      {loading ? (
        <div className="flex items-center justify-center min-h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : feedback.length === 0 ? (
        <div className="text-center py-12">
          <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">No feedback found</p>
        </div>
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Message</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {feedback.map((item) => {
                  const cat = categoryConfig[item.category] || categoryConfig.general;
                  const stat = statusConfig[item.status] || statusConfig.new;
                  const CatIcon = cat.icon;
                  return (
                    <TableRow
                      key={item.id}
                      className="cursor-pointer"
                      onClick={() => openDetail(item)}
                    >
                      <TableCell className="text-sm">{item.user_email}</TableCell>
                      <TableCell>
                        <Badge variant="secondary" className={cat.badgeClass}>
                          <CatIcon className="h-3 w-3 mr-1" />
                          {cat.label}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground max-w-xs truncate">{item.message}</TableCell>
                      <TableCell>
                        <Badge variant="secondary" className={stat.badgeClass}>
                          {stat.label}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {new Date(item.created_at).toLocaleDateString()}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Page {currentPage} of {totalPages}
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setOffset(Math.max(0, offset - limit))}
              disabled={offset === 0}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setOffset(offset + limit)}
              disabled={offset + limit >= total}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Detail Dialog */}
      <Dialog open={!!selected} onOpenChange={(open) => !open && setSelected(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Feedback Detail</DialogTitle>
          </DialogHeader>

          {selected && (
            <div className="space-y-4">
              <div className="flex gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">From: </span>
                  <span className="text-foreground">{selected.user_email}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Date: </span>
                  <span className="text-foreground">{new Date(selected.created_at).toLocaleString()}</span>
                </div>
              </div>

              <div>
                <Badge variant="secondary" className={categoryConfig[selected.category]?.badgeClass || ''}>
                  {categoryConfig[selected.category]?.label || selected.category}
                </Badge>
              </div>

              <div className="bg-muted border border-border rounded-lg p-4">
                <p className="text-sm text-foreground whitespace-pre-wrap">{selected.message}</p>
              </div>

              <div>
                <Label>Status</Label>
                <Select value={editStatus} onValueChange={setEditStatus}>
                  <SelectTrigger className="w-full mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="new">New</SelectItem>
                    <SelectItem value="reviewed">Reviewed</SelectItem>
                    <SelectItem value="resolved">Resolved</SelectItem>
                    <SelectItem value="archived">Archived</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Admin Notes</Label>
                <Textarea
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  placeholder="Internal notes..."
                  rows={3}
                  className="mt-1"
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setSelected(null)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving && <Loader2 className="h-3 w-3 animate-spin mr-2" />}
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
