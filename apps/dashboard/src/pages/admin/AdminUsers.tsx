import { useEffect, useState } from 'react';
import {
  getAdminUsers,
  updateAdminUserPlan,
  updateAdminUserStatus,
  deleteAdminUser,
  type AdminUser,
} from '../../lib/platform-api';
import { useSudoContext } from '@node2flow/dashboard-core';
import { Loader2, Search, ChevronLeft, ChevronRight, AlertCircle, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';

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

  useEffect(() => { fetchUsers(); }, [offset, planFilter, statusFilter]);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setOffset(0);
    fetchUsers();
  }

  async function handleChangePlan(userId: string, plan: string) {
    const res = await updateAdminUserPlan(userId, plan);
    if (res.success) fetchUsers();
    else alert(res.error?.message || 'Failed');
  }

  async function handleChangeStatus(userId: string, status: string) {
    const res = await updateAdminUserStatus(userId, status);
    if (res.success) fetchUsers();
    else alert(res.error?.message || 'Failed');
  }

  async function handleDelete(userId: string, email: string) {
    if (!totpEnabled) {
      alert('Please enable Two-Factor Authentication in Settings to perform this action.');
      return;
    }
    if (!confirm(`Delete user ${email}? This cannot be undone.`)) return;
    await withSudo(async () => {
      const res = await deleteAdminUser(userId);
      if (res.success) fetchUsers();
      else alert(res.error?.message || 'Failed');
      return true;
    });
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Users</h1>
        <p className="text-muted-foreground mt-1">{total} total users</p>
      </div>

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

        <select value={planFilter} onChange={(e) => { setPlanFilter(e.target.value); setOffset(0); }} className="bg-card text-foreground border border-border rounded-lg text-sm px-3 py-2">
          <option value="">All Plans</option>
          <option value="free">Free</option>
          <option value="pro">Pro</option>
          <option value="enterprise">Enterprise</option>
        </select>

        <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setOffset(0); }} className="bg-card text-foreground border border-border rounded-lg text-sm px-3 py-2">
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="suspended">Suspended</option>
          <option value="deleted">Deleted</option>
        </select>
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
                      <TableHead>Actions</TableHead>
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
                          <select
                            value={u.plan}
                            onChange={(e) => handleChangePlan(u.id, e.target.value)}
                            className="bg-card text-foreground text-sm border border-border rounded px-2 py-1"
                          >
                            <option value="free">Free</option>
                            <option value="pro">Pro</option>
                            <option value="enterprise">Enterprise</option>
                          </select>
                        </TableCell>
                        <TableCell>
                          <Badge variant={
                            u.status === 'active' ? 'default' :
                            u.status === 'suspended' ? 'secondary' : 'destructive'
                          } className={
                            u.status === 'active' ? 'bg-emerald-900/30 text-emerald-400 hover:bg-emerald-900/40' :
                            u.status === 'suspended' ? 'bg-amber-900/30 text-amber-400 hover:bg-amber-900/40' :
                            'bg-red-900/30 text-red-400 hover:bg-red-900/40'
                          }>
                            {u.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground capitalize">{u.oauth_provider || 'email'}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">{new Date(u.created_at).toLocaleDateString()}</TableCell>
                        <TableCell className="text-sm space-x-2">
                          {u.status === 'active' ? (
                            <Button variant="link" size="sm" className="text-amber-400 p-0 h-auto" onClick={() => handleChangeStatus(u.id, 'suspended')}>Suspend</Button>
                          ) : u.status === 'suspended' ? (
                            <Button variant="link" size="sm" className="text-emerald-400 p-0 h-auto" onClick={() => handleChangeStatus(u.id, 'active')}>Activate</Button>
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
    </div>
  );
}
