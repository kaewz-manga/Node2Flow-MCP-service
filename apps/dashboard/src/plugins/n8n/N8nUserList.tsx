import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { listN8nUsers, deleteN8nUser } from '../../lib/gateway-api';
import { usePluginConnection, Button, Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter, Table, TableHeader, TableBody, TableRow, TableHead, TableCell, Alert, AlertDescription, Badge, Separator } from '@node2flow/dashboard-core';

import StatusBadge from './components/StatusBadge';
import ConfirmDialog from './components/ConfirmDialog';
import { Loader2, RefreshCw, Trash2, AlertCircle, UserCog, Users, Crown, Shield, UserX } from 'lucide-react';






export default function N8nUserList() {
  const activeConnection = usePluginConnection('n8n');
  const connectionId = activeConnection?.id;
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<any>(null);

  async function fetch() {
    if (!connectionId) return;
    setLoading(true);
    setError('');
    const res = await listN8nUsers(connectionId);
    if (res.success && res.data) {
      const d = res.data as any;
      setUsers(Array.isArray(d) ? d : d.data || []);
    } else {
      setError(res.error?.message || 'Failed');
    }
    setLoading(false);
  }

  useEffect(() => { if (connectionId) fetch(); }, [connectionId]);

  async function handleDelete() {
    if (!deleteTarget || !connectionId) return;
    const res = await deleteN8nUser(connectionId, deleteTarget.id);
    if (res.success) { setDeleteTarget(null); fetch(); }
    else toast.error(res.error?.message || 'Failed');
  }

  if (!activeConnection) return <div className="text-center py-12 text-muted-foreground">No connection selected. Please select a connection from the sidebar.</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">n8n Users</h1>
          <p className="text-muted-foreground mt-1">{activeConnection.name} - {users.length} users</p>
        </div>
        <Button variant="outline" size="icon" onClick={fetch} title="Refresh">
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>

      {/* Stat Cards */}
      {!loading && (() => {
        const ownerCount = users.filter(u => u.role?.includes('owner')).length;
        const adminCount = users.filter(u => u.role?.includes('admin')).length;
        const activeCount = users.filter(u => !u.isPending && !u.disabled).length;
        const pendingCount = users.filter(u => u.isPending).length;
        return (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="bg-gradient-to-t from-primary/5 to-card shadow-sm">
              <CardHeader className="pb-2">
                <CardDescription>Total Users</CardDescription>
                <CardTitle className="text-2xl font-semibold tabular-nums">{users.length}</CardTitle>
              </CardHeader>
              <CardFooter className="text-sm text-muted-foreground">
                <Users className="h-3.5 w-3.5 mr-1.5 text-primary" />
                All accounts
              </CardFooter>
            </Card>
            <Card className="bg-gradient-to-t from-purple-500/5 to-card shadow-sm">
              <CardHeader className="pb-2">
                <CardDescription>Owners & Admins</CardDescription>
                <CardTitle className="text-2xl font-semibold tabular-nums text-purple-500">{ownerCount + adminCount}</CardTitle>
              </CardHeader>
              <CardFooter className="text-sm text-muted-foreground">
                <Crown className="h-3.5 w-3.5 mr-1.5 text-purple-500" />
                {ownerCount} owner, {adminCount} admin
              </CardFooter>
            </Card>
            <Card className="bg-gradient-to-t from-emerald-500/5 to-card shadow-sm">
              <CardHeader className="pb-2">
                <CardDescription>Active</CardDescription>
                <CardTitle className="text-2xl font-semibold tabular-nums text-emerald-500">{activeCount}</CardTitle>
              </CardHeader>
              <CardFooter className="text-sm text-muted-foreground">
                <Shield className="h-3.5 w-3.5 mr-1.5 text-emerald-500" />
                Verified accounts
              </CardFooter>
            </Card>
            <Card className="bg-gradient-to-t from-amber-500/5 to-card shadow-sm">
              <CardHeader className="pb-2">
                <CardDescription>Pending</CardDescription>
                <CardTitle className="text-2xl font-semibold tabular-nums text-amber-500">{pendingCount}</CardTitle>
              </CardHeader>
              <CardFooter className="text-sm text-muted-foreground">
                <UserX className="h-3.5 w-3.5 mr-1.5 text-amber-500" />
                Awaiting setup
              </CardFooter>
            </Card>
          </div>
        );
      })()}

      <Separator />

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {loading ? (
        <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
      ) : (
        <Card className="hover:shadow-md transition-all">
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <UserCog className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">
                          {user.firstName || user.lastName ? `${user.firstName || ''} ${user.lastName || ''}`.trim() : user.id}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">{user.email || '-'}</TableCell>
                    <TableCell>
                      <Badge variant="secondary" className={
                        user.role?.includes('owner') ? 'bg-purple-900/30 text-purple-400' :
                        user.role?.includes('admin') ? 'bg-blue-900/30 text-blue-400' :
                        'bg-primary/10 text-primary'
                      }>
                        {user.role?.includes('owner') ? 'Owner' :
                         user.role?.includes('admin') ? 'Admin' :
                         user.role || 'Member'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={user.isPending ? 'pending' : user.disabled ? 'inactive' : 'active'} />
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="icon" className="text-red-400 hover:bg-red-900/30" onClick={() => setDeleteTarget(user)} title="Delete user">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {users.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">No users found</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete User"
        message={`Delete user "${deleteTarget?.email || deleteTarget?.id}"? This cannot be undone.`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
