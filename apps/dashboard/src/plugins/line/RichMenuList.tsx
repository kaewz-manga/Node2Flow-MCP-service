import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { lineGetRichMenus, lineDeleteRichMenu, lineSetDefaultRichMenu, lineLinkRichMenuToUser } from '../../lib/gateway-api';
import { usePluginConnection, Button, Input, Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter, Alert, AlertDescription, Separator, Badge } from '@node2flow/dashboard-core';
import ConfirmDialog from '../n8n/components/ConfirmDialog';
import JsonViewer from '../n8n/components/JsonViewer';
import { Loader2, RefreshCw, AlertCircle, Menu, Trash2, Star, Link, ChevronRight, ChevronDown } from 'lucide-react';

export default function RichMenuList() {
  const activeConnection = usePluginConnection('line');
  const connectionId = activeConnection?.id;
  const [menus, setMenus] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<any>(null);

  // Link to user form
  const [linkMenuId, setLinkMenuId] = useState('');
  const [linkUserId, setLinkUserId] = useState('');
  const [linking, setLinking] = useState(false);

  async function fetch() {
    if (!connectionId) return;
    setLoading(true);
    setError('');
    const res = await lineGetRichMenus(connectionId);
    if (res.success && res.data) {
      const d = res.data as any;
      setMenus(Array.isArray(d) ? d : d.richmenus || d.richMenus || d.data || []);
    } else {
      setError(res.error?.message || 'Failed to load rich menus');
    }
    setLoading(false);
  }

  useEffect(() => { if (connectionId) fetch(); }, [connectionId]);

  async function handleDelete() {
    if (!deleteTarget || !connectionId) return;
    const res = await lineDeleteRichMenu(connectionId, deleteTarget.richMenuId);
    if (res.success) { toast.success('Rich menu deleted'); setDeleteTarget(null); fetch(); }
    else toast.error(res.error?.message || 'Failed to delete');
  }

  async function handleSetDefault(richMenuId: string) {
    if (!connectionId) return;
    const res = await lineSetDefaultRichMenu(connectionId, richMenuId);
    if (res.success) toast.success('Set as default rich menu');
    else toast.error(res.error?.message || 'Failed');
  }

  async function handleLinkToUser() {
    if (!linkMenuId.trim() || !linkUserId.trim() || !connectionId) return;
    setLinking(true);
    const res = await lineLinkRichMenuToUser(connectionId, linkUserId.trim(), linkMenuId.trim());
    if (res.success) { toast.success('Rich menu linked to user'); setLinkUserId(''); }
    else toast.error(res.error?.message || 'Failed');
    setLinking(false);
  }

  if (!activeConnection) {
    return (
      <Card><CardContent className="text-center py-12">
        <h3 className="text-lg font-medium text-foreground mb-2">No connection selected</h3>
        <p className="text-sm text-muted-foreground">Select a connection from the sidebar to continue.</p>
      </CardContent></Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Rich Menus</h1>
          <p className="text-muted-foreground mt-1">{activeConnection.name} - {menus.length} menus <Badge variant="secondary" className="ml-1">6 tools</Badge></p>
        </div>
        <Button variant="outline" size="icon" onClick={fetch} title="Refresh"><RefreshCw className="h-4 w-4" /></Button>
      </div>

      {/* Stat Cards */}
      {!loading && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <Card className="bg-gradient-to-t from-primary/5 to-card shadow-sm">
            <CardHeader className="pb-2">
              <CardDescription>Total Menus</CardDescription>
              <CardTitle className="text-2xl font-semibold tabular-nums">{menus.length}</CardTitle>
            </CardHeader>
            <CardFooter className="text-sm text-muted-foreground">
              <Menu className="h-3.5 w-3.5 mr-1.5 text-primary" /> Rich menus
            </CardFooter>
          </Card>
          <Card className="bg-gradient-to-t from-green-500/5 to-card shadow-sm">
            <CardHeader className="pb-2">
              <CardDescription>Selected Menus</CardDescription>
              <CardTitle className="text-2xl font-semibold tabular-nums">{menus.filter(m => m.selected).length}</CardTitle>
            </CardHeader>
            <CardFooter className="text-sm text-muted-foreground">
              <Star className="h-3.5 w-3.5 mr-1.5 text-green-500" /> Active by default
            </CardFooter>
          </Card>
          <Card className="bg-gradient-to-t from-amber-500/5 to-card shadow-sm">
            <CardHeader className="pb-2">
              <CardDescription>Total Areas</CardDescription>
              <CardTitle className="text-2xl font-semibold tabular-nums">{menus.reduce((sum, m) => sum + (m.areas?.length || 0), 0)}</CardTitle>
            </CardHeader>
            <CardFooter className="text-sm text-muted-foreground">
              <Link className="h-3.5 w-3.5 mr-1.5 text-amber-500" /> Tap actions
            </CardFooter>
          </Card>
        </div>
      )}

      <Separator />

      {error && (
        <Alert variant="destructive"><AlertCircle className="h-4 w-4" /><AlertDescription>{error}</AlertDescription></Alert>
      )}

      {loading ? (
        <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
      ) : (
        <>
          {/* Rich Menu List */}
          <div className="space-y-3">
            {menus.map((menu) => (
              <Card key={menu.richMenuId} className="hover:shadow-md transition-all">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setExpandedId(expandedId === menu.richMenuId ? null : menu.richMenuId)}>
                      {expandedId === menu.richMenuId ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                    </Button>
                    <Menu className="h-4 w-4 text-primary shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{menu.name || 'Unnamed'}</p>
                      <p className="text-xs text-muted-foreground">{menu.chatBarText} | {menu.areas?.length || 0} areas | {menu.size?.width}x{menu.size?.height}</p>
                    </div>
                    {menu.selected && <Badge variant="secondary" className="text-xs">Default</Badge>}
                    <span className="text-xs text-muted-foreground font-mono">{menu.richMenuId?.substring(0, 12)}...</span>
                    <Button variant="ghost" size="icon" className="h-7 w-7 hover:text-green-400" onClick={() => handleSetDefault(menu.richMenuId)} title="Set as default">
                      <Star className="h-3.5 w-3.5" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7 hover:text-red-400 hover:bg-red-900/30" onClick={() => setDeleteTarget(menu)} title="Delete">
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                  {expandedId === menu.richMenuId && (
                    <div className="mt-3 pt-3 border-t border-border">
                      <JsonViewer data={menu} />
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
            {menus.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">No rich menus found</div>
            )}
          </div>

          {/* Link to User */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2"><Link className="h-4 w-4 text-primary" /> Link Menu to User</CardTitle>
              <CardDescription>Assign a specific rich menu to a user</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <Input value={linkMenuId} onChange={(e) => setLinkMenuId(e.target.value)} placeholder="Rich Menu ID" />
                <Input value={linkUserId} onChange={(e) => setLinkUserId(e.target.value)} placeholder="User ID" />
              </div>
              <Button
               
                onClick={handleLinkToUser}
                disabled={linking || !linkMenuId.trim() || !linkUserId.trim()}
              >
                {linking ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Link className="h-4 w-4 mr-2" />}
                Link Menu
              </Button>
            </CardContent>
          </Card>
        </>
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete Rich Menu"
        message={`Delete rich menu "${deleteTarget?.name}"? It will be unlinked from all users.`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
