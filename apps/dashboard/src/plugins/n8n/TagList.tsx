import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { listTags, createTag, updateTag, deleteTag } from '../../lib/gateway-api';
import { usePluginConnection, Button, Input, Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter, Alert, AlertDescription, Separator } from '@node2flow/dashboard-core';

import ConfirmDialog from './components/ConfirmDialog';
import { Loader2, Plus, Pencil, Trash2, Check, X, RefreshCw, AlertCircle, Tag, Tags, Clock } from 'lucide-react';





export default function TagList() {
  const activeConnection = usePluginConnection('n8n');
  const connectionId = activeConnection?.id;
  const [tags, setTags] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<any>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [newName, setNewName] = useState('');
  const [creating, setCreating] = useState(false);

  async function fetch() {
    if (!connectionId) return;
    setLoading(true);
    setError('');
    const res = await listTags(connectionId);
    if (res.success && res.data) {
      const d = res.data as any;
      setTags(Array.isArray(d) ? d : d.data || []);
    } else {
      setError(res.error?.message || 'Failed');
    }
    setLoading(false);
  }

  useEffect(() => { if (connectionId) fetch(); }, [connectionId]);

  async function handleCreate() {
    if (!newName.trim() || !connectionId) return;
    setCreating(true);
    const res = await createTag(connectionId, newName.trim());
    if (res.success) { setNewName(''); fetch(); }
    else toast.error(res.error?.message || 'Failed');
    setCreating(false);
  }

  async function handleUpdate(id: string) {
    if (!editName.trim() || !connectionId) return;
    const res = await updateTag(connectionId, id, editName.trim());
    if (res.success) { setEditingId(null); fetch(); }
    else toast.error(res.error?.message || 'Failed');
  }

  async function handleDelete() {
    if (!deleteTarget || !connectionId) return;
    const res = await deleteTag(connectionId, deleteTarget.id);
    if (res.success) { setDeleteTarget(null); fetch(); }
    else toast.error(res.error?.message || 'Failed');
  }

  if (!activeConnection) return <div className="text-center py-12 text-muted-foreground">No connection selected. Please select a connection from the sidebar.</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Tags</h1>
          <p className="text-muted-foreground mt-1">{activeConnection.name} - {tags.length} tags</p>
        </div>
        <Button variant="outline" size="icon" onClick={fetch} title="Refresh">
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>

      {/* Stat Cards */}
      {!loading && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <Card className="bg-gradient-to-t from-primary/5 to-card shadow-sm">
            <CardHeader className="pb-2">
              <CardDescription>Total Tags</CardDescription>
              <CardTitle className="text-2xl font-semibold tabular-nums">{tags.length}</CardTitle>
            </CardHeader>
            <CardFooter className="text-sm text-muted-foreground">
              <Tags className="h-3.5 w-3.5 mr-1.5 text-primary" />
              Workflow labels
            </CardFooter>
          </Card>
          <Card className="bg-gradient-to-t from-primary/5 to-card shadow-sm">
            <CardHeader className="pb-2">
              <CardDescription>Latest Tag</CardDescription>
              <CardTitle className="text-lg font-semibold truncate">
                {tags.length > 0 ? tags[tags.length - 1]?.name || '-' : '-'}
              </CardTitle>
            </CardHeader>
            <CardFooter className="text-sm text-muted-foreground">
              <Tag className="h-3.5 w-3.5 mr-1.5 text-primary" />
              Most recently added
            </CardFooter>
          </Card>
          <Card className="bg-gradient-to-t from-amber-500/5 to-card shadow-sm">
            <CardHeader className="pb-2">
              <CardDescription>Last Updated</CardDescription>
              <CardTitle className="text-lg font-semibold tabular-nums">
                {tags.length > 0 && tags.some(t => t.updatedAt)
                  ? new Date(tags.reduce((a: any, b: any) =>
                      (a.updatedAt || '') > (b.updatedAt || '') ? a : b
                    ).updatedAt || '').toLocaleDateString()
                  : '-'}
              </CardTitle>
            </CardHeader>
            <CardFooter className="text-sm text-muted-foreground">
              <Clock className="h-3.5 w-3.5 mr-1.5 text-amber-500" />
              Most recent change
            </CardFooter>
          </Card>
        </div>
      )}

      <Separator />

      {/* Create tag */}
      <div className="flex gap-2">
        <Input
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') handleCreate(); }}
          placeholder="New tag name..."
          className="flex-1"
        />
        <Button className="" onClick={handleCreate} disabled={creating || !newName.trim()}>
          {creating ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Plus className="h-4 w-4 mr-2" />} Add Tag
        </Button>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {loading ? (
        <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {tags.map((tag) => (
            <Card key={tag.id} className="hover:shadow-md transition-all">
              <CardContent className="p-3 flex items-center gap-3">
                <Tag className="h-4 w-4 text-primary shrink-0" />
                {editingId === tag.id ? (
                  <div className="flex-1 flex gap-2">
                    <Input
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter') handleUpdate(tag.id); if (e.key === 'Escape') setEditingId(null); }}
                      className="h-8 text-sm"
                      autoFocus
                    />
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-primary hover:bg-primary/10" onClick={() => handleUpdate(tag.id)}><Check className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setEditingId(null)}><X className="h-4 w-4" /></Button>
                  </div>
                ) : (
                  <>
                    <span className="flex-1 text-sm font-medium text-foreground">{tag.name}</span>
                    <span className="text-xs text-muted-foreground font-mono">{tag.id}</span>
                    <Button variant="ghost" size="icon" className="h-7 w-7 hover:text-primary hover:bg-primary/10" onClick={() => { setEditingId(tag.id); setEditName(tag.name); }} title="Edit">
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7 hover:text-red-400 hover:bg-red-900/30" onClick={() => setDeleteTarget(tag)} title="Delete">
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>
          ))}
          {tags.length === 0 && (
            <div className="col-span-full text-center py-8 text-muted-foreground">No tags found</div>
          )}
        </div>
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete Tag"
        message={`Delete tag "${deleteTarget?.name}"? This will remove it from all workflows.`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
