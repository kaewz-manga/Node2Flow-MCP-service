import { useEffect, useState, useMemo } from 'react';
import {
  getAdminUsers,
  updateAdminUserPlan,
  updateAdminUserStatus,
  deleteAdminUser,
  type AdminUser,
} from '../../lib/platform-api';
import { useSudoContext, Button, Input, Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter, Table, TableHeader, TableBody, TableRow, TableHead, TableCell, Alert, AlertDescription, Badge, Select, SelectTrigger, SelectValue, SelectContent, SelectItem, AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from '@node2flow/dashboard-core';
import { AdminNav } from '../../components/admin-nav';
import { toast } from 'sonner';

import { Loader2, Search, ChevronLeft, ChevronRight, AlertCircle, Users, UserCheck, Crown, UserX } from 'lucide-react';







export default function AdminUsers() {
  const { withSudo, totpEnabled } = useSudoContext();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [planFilter, setPlanFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [offset, setOffset] = useState(0);
  const limit = 20;

  async function fetchUsers() {
    setLoading(true);
    setError('');
    const res = await getAdminUsers({
      limit,
      offset,
      plan: planFilter || undefined,
      status: statusFilter || undefined,
      search: search || undefined,
    });
    if (res.success && res.data) {
      setUsers(res.data.users);
      setTotal(res.data.total);
    } else {
      setError(res.error?.message || 'Failed to load users');
    }
    setLoading(false);
  }

  useEffect(() => {
    fetchUsers();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [offset, planFilter, statusFilter]);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setOffset(0);
    fetchUsers();
  }

  // Delete confirmation dialog state
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; email: string } | null>(null);

  async function handleChangePlan(userId: string, plan: string) {
    const res = await updateAdminUserPlan(userId, plan);
    if (res.success) fetchUsers();
    else toast.error(res.error?.message || 'Failed');
  }

  async function handleChangeStatus(userId: string, status: string) {
    const res = await updateAdminUserStatus(userId, status);
    if (res.success) fetchUsers();
    else toast.error(res.error?.message || 'Failed');
  }

  function handleDelete(userId: string, email: string) {
    if (!totpEnabled) {
      toast.error('Please enable Two-Factor Authentication in Settings to perform this action.');
      return;
    }
    setDeleteTarget({ id: userId, email });
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    await withSudo(async () => {
      const res = await deleteAdminUser(deleteTarget.id);
      if (res.success) fetchUsers();
      else toast.error(res.error?.message || 'Failed');
      setDeleteTarget(null);
      return true;
    });
  }

  // Compute stat summaries from loaded users (current page + total)
  const stats = useMemo(() => {
    const active = users.filter(u => u.status === 'active').length;
    const suspended = users.filter(u => u.status === 'suspended').length;
    const admins = users.filter(u => u.is_admin === 1).length;
    const planCounts: Record<string, number> = {};
    users.forEach(u => { planCounts[u.plan] = (planCounts[u.plan] || 0) + 1; });
    return { active, suspended, admins, planCounts };
  }, [users]);

  return (
    <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
      <AdminNav />

      {/* Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-t from-primary/5 to-card shadow-sm">
          <CardHeader className="pb-2">
            <CardDescription>Total Users</CardDescription>
            <CardTitle className="text-2xl font-semibold tabular-nums">{total}</CardTitle>
          </CardHeader>
          <CardFooter className="text-sm text-muted-foreground">
            <Users className="h-3.5 w-3.5 mr-1.5 text-primary" />
            All registered accounts
          </CardFooter>
        </Card>

        <Card className="bg-gradient-to-t from-green-500/5 to-card shadow-sm">
          <CardHeader className="pb-2">
            <CardDescription>Active</CardDescription>
            <CardTitle className="text-2xl font-semibold tabular-nums text-green-400">{stats.active}</CardTitle>
          </CardHeader>
          <CardFooter className="text-sm text-muted-foreground">
            <UserCheck className="h-3.5 w-3.5 mr-1.5 text-green-400" />
            On this page
          </CardFooter>
        </Card>

        <Card className="bg-gradient-to-t from-purple-500/5 to-card shadow-sm">
          <CardHeader className="pb-2">
            <CardDescription>Admins</CardDescription>
            <CardTitle className="text-2xl font-semibold tabular-nums text-purple-400">{stats.admins}</CardTitle>
          </CardHeader>
          <CardFooter className="text-sm text-muted-foreground">
            <Crown className="h-3.5 w-3.5 mr-1.5 text-purple-400" />
            Admin privileges
          </CardFooter>
        </Card>

        <Card className="bg-gradient-to-t from-amber-500/5 to-card shadow-sm">
          <CardHeader className="pb-2">
            <CardDescription>Suspended</CardDescription>
            <CardTitle className="text-2xl font-semibold tabular-nums text-amber-400">{stats.suspended}</CardTitle>
          </CardHeader>
          <CardFooter className="text-sm text-muted-foreground">
            <UserX className="h-3.5 w-3.5 mr-1.5 text-amber-400" />
            Restricted access
          </CardFooter>
        </Card>
      </div>

      {/* Plan Distribution Bar */}
      {users.length > 0 && (
        <Card className="shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-3 mb-3">
              <p className="text-sm font-medium text-foreground">Plan Distribution</p>
              <div className="flex gap-3 ml-auto text-xs text-muted-foreground">
                {Object.entries(stats.planCounts).map(([plan, count]) => (
                  <span key={plan} className="flex items-center gap-1.5">
                    <span className={`w-2.5 h-2.5 rounded-full ${
                      plan === 'enterprise' ? 'bg-purple-500' :
                      plan === 'pro' ? 'bg-primary' : 'bg-muted-foreground'
                    }`} />
                    <span className="capitalize">{plan}</span>
                    <span className="font-medium text-foreground">{count}</span>
                  </span>
                ))}
              </div>
            </div>
            <div className="h-2.5 bg-muted rounded-full overflow-hidden flex">
              {Object.entries(stats.planCounts).map(([plan, count]) => (
                <div
                  key={plan}
                  className={`h-full transition-all ${
                    plan === 'enterprise' ? 'bg-purple-500' :
                    plan === 'pro' ? 'bg-primary' : 'bg-muted-foreground/50'
                  }`}
                  style={{ width: `${(count / users.length) * 100}%` }}
                />
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 w-auto"
            />
          </div>
          <Button type="submit" size="sm">Search</Button>
        </form>

        <Select value={planFilter || 'all'} onValueChange={(value) => { setPlanFilter(value === 'all' ? '' : value); setOffset(0); }}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="All Plans" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Plans</SelectItem>
            <SelectItem value="free">Free</SelectItem>
            <SelectItem value="pro">Pro</SelectItem>
            <SelectItem value="enterprise">Enterprise</SelectItem>
          </SelectContent>
        </Select>

        <Select value={statusFilter || 'all'} onValueChange={(value) => { setStatusFilter(value === 'all' ? '' : value); setOffset(0); }}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="All Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="suspended">Suspended</SelectItem>
            <SelectItem value="deleted">Deleted</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {loading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      ) : (
        <>
          {/* Table */}
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Email</TableHead>
                      <TableHead>Plan</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Auth</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((u) => (
                      <TableRow key={u.id}>
                        <TableCell className="text-sm">
                          {u.email}
                          {u.is_admin === 1 && (
                            <Badge variant="destructive" className="ml-2 text-xs">Admin</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <Select value={u.plan} onValueChange={(value) => handleChangePlan(u.id, value)}>
                            <SelectTrigger className="w-[130px] h-8">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="free">Free</SelectItem>
                              <SelectItem value="pro">Pro</SelectItem>
                              <SelectItem value="enterprise">Enterprise</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <span className={`h-2 w-2 rounded-full ${
                              u.status === 'active' ? 'bg-green-500' :
                              u.status === 'suspended' ? 'bg-amber-500' : 'bg-red-500'
                            }`} />
                            <span className="text-sm text-muted-foreground capitalize">{u.status}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground capitalize">{u.oauth_provider || 'email'}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">{new Date(u.created_at).toLocaleDateString()}</TableCell>
                        <TableCell className="text-sm space-x-2">
                          {u.status === 'active' ? (
                            <Button variant="link" size="sm" className="text-amber-400 p-0 h-auto" onClick={() => handleChangeStatus(u.id, 'suspended')}>Suspend</Button>
                          ) : u.status === 'suspended' ? (
                            <Button variant="link" size="sm" className="text-green-400 p-0 h-auto" onClick={() => handleChangeStatus(u.id, 'active')}>Activate</Button>
                          ) : null}
                          <Button variant="link" size="sm" className="text-red-400 p-0 h-auto" onClick={() => handleDelete(u.id, u.email)}>Delete</Button>
                        </TableCell>
                      </TableRow>
                    ))}
                    {users.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">No users found</TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          {/* Pagination */}
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Showing {offset + 1}-{Math.min(offset + limit, total)} of {total}
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
        </>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete User</AlertDialogTitle>
            <AlertDialogDescription>
              Delete user {deleteTarget?.email}? This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
