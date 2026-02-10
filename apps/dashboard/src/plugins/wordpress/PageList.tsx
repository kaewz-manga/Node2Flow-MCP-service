import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { listPages, getPage, createPage, updatePage, deletePage } from '../../lib/gateway-api';
import {
  useConnection, Button, Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter,
  Input, Textarea, Badge, Separator, Alert, AlertDescription,
  Dialog, DialogContent, DialogHeader, DialogFooter, DialogTitle,
  Select, SelectTrigger, SelectValue, SelectContent, SelectItem,
} from '@node2flow/dashboard-core';
import JsonViewer from '../n8n/components/JsonViewer';
import ConfirmDialog from '../n8n/components/ConfirmDialog';
import {
  Loader2, Plus, RefreshCw, ChevronDown, ChevronRight, Trash2,
  Pencil, AlertCircle, Eye, Clock, X,
  Layers, CheckCircle, FileEdit, Layout,
} from 'lucide-react';

export default function PageList() {
  const { activeConnection } = useConnection();
  const connectionId = activeConnection?.id;
  const [pages, setPages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<any>(null);

  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [detail, setDetail] = useState<any>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const [showCreate, setShowCreate] = useState(false);
  const [createTitle, setCreateTitle] = useState('');
  const [createContent, setCreateContent] = useState('');
  const [createStatus, setCreateStatus] = useState('draft');
  const [creating, setCreating] = useState(false);

  const [editTarget, setEditTarget] = useState<any>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');
  const [editStatus, setEditStatus] = useState('');
  const [saving, setSaving] = useState(false);

  async function fetchList() {
    if (!connectionId) return;
    setLoading(true);
    setError('');
    const res = await listPages(connectionId);
    if (res.success && res.data) {
      const data = res.data as any;
      setPages(Array.isArray(data) ? data : data.data || []);
    } else {
      setError(res.error?.message || 'Failed to load pages');
    }
    setLoading(false);
  }

  useEffect(() => { if (connectionId) fetchList(); }, [connectionId]);

  async function loadDetail(id: number) {
    if (!connectionId) return;
    if (expandedId === id) { setExpandedId(null); return; }
    setExpandedId(id);
    setDetailLoading(true);
    const res = await getPage(connectionId, id);
    if (res.success && res.data) setDetail(res.data);
    setDetailLoading(false);
  }

  async function handleCreate() {
    if (!connectionId || !createTitle.trim()) return;
    setCreating(true);
    const res = await createPage(connectionId, { title: createTitle, content: createContent, status: createStatus });
    if (res.success) {
      toast.success('Page created');
      setShowCreate(false);
      setCreateTitle('');
      setCreateContent('');
      setCreateStatus('draft');
      fetchList();
    } else toast.error(res.error?.message || 'Create failed');
    setCreating(false);
  }

  async function handleUpdate() {
    if (!connectionId || !editTarget) return;
    setSaving(true);
    const res = await updatePage(connectionId, editTarget.id, { title: editTitle, content: editContent, status: editStatus });
    if (res.success) {
      toast.success('Page updated');
      setEditTarget(null);
      fetchList();
      if (expandedId === editTarget.id) loadDetail(editTarget.id);
    } else toast.error(res.error?.message || 'Update failed');
    setSaving(false);
  }

  async function handleDelete() {
    if (!deleteTarget || !connectionId) return;
    const res = await deletePage(connectionId, deleteTarget.id);
    if (res.success) {
      toast.success('Page deleted');
      setDeleteTarget(null);
      if (expandedId === deleteTarget.id) setExpandedId(null);
      fetchList();
    } else toast.error(res.error?.message || 'Delete failed');
  }

  function openEdit(page: any) {
    setEditTarget(page);
    setEditTitle(page.title?.rendered || page.title || '');
    setEditContent(page.content?.rendered || page.content || '');
    setEditStatus(page.status || 'draft');
  }

  function getTitle(page: any) {
    return page?.title?.rendered || page?.title || 'Untitled';
  }

  if (!activeConnection) return <div className="text-center py-12 text-muted-foreground">No connection selected. Please select a connection from the sidebar.</div>;

  const published = pages.filter(p => p.status === 'publish').length;
  const drafts = pages.filter(p => p.status === 'draft').length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Pages</h1>
          <p className="text-muted-foreground mt-1">{activeConnection.name} - {pages.length} pages</p>
        </div>
        <div className="flex gap-2">
          <Button className="bg-emerald-600 hover:bg-emerald-700 text-white" onClick={() => setShowCreate(!showCreate)}>
            <Plus className="h-4 w-4 mr-2" /> Create
          </Button>
          <Button variant="outline" size="icon" onClick={fetchList} title="Refresh">
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {!loading && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <Card className="bg-gradient-to-t from-primary/5 to-card shadow-sm">
            <CardHeader className="pb-2">
              <CardDescription>Total Pages</CardDescription>
              <CardTitle className="text-2xl font-semibold tabular-nums">{pages.length}</CardTitle>
            </CardHeader>
            <CardFooter className="text-sm text-muted-foreground">
              <Layers className="h-3.5 w-3.5 mr-1.5 text-primary" /> All pages
            </CardFooter>
          </Card>
          <Card className="bg-gradient-to-t from-emerald-500/5 to-card shadow-sm">
            <CardHeader className="pb-2">
              <CardDescription>Published</CardDescription>
              <CardTitle className="text-2xl font-semibold tabular-nums text-emerald-500">{published}</CardTitle>
            </CardHeader>
            <CardFooter className="text-sm text-muted-foreground">
              <CheckCircle className="h-3.5 w-3.5 mr-1.5 text-emerald-500" /> Live
            </CardFooter>
          </Card>
          <Card className="bg-gradient-to-t from-amber-500/5 to-card shadow-sm">
            <CardHeader className="pb-2">
              <CardDescription>Drafts</CardDescription>
              <CardTitle className="text-2xl font-semibold tabular-nums text-amber-500">{drafts}</CardTitle>
            </CardHeader>
            <CardFooter className="text-sm text-muted-foreground">
              <FileEdit className="h-3.5 w-3.5 mr-1.5 text-amber-500" /> Unpublished
            </CardFooter>
          </Card>
        </div>
      )}

      <Separator />

      {showCreate && (
        <Card className="hover:shadow-md transition-all">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Create Page</CardTitle>
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setShowCreate(false)}><X className="h-4 w-4" /></Button>
            </div>
          </CardHeader>
          <CardContent className="pt-0 space-y-3">
            <Input placeholder="Page title" value={createTitle} onChange={(e) => setCreateTitle(e.target.value)} />
            <Textarea placeholder="Page content (HTML)" value={createContent} onChange={(e) => setCreateContent(e.target.value)} rows={8} className="font-mono text-sm" />
            <Select value={createStatus} onValueChange={setCreateStatus}>
              <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="publish">Publish</SelectItem>
                <SelectItem value="private">Private</SelectItem>
              </SelectContent>
            </Select>
            <Button className="bg-emerald-600 hover:bg-emerald-700 text-white" onClick={handleCreate} disabled={creating || !createTitle.trim()}>
              {creating ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Plus className="h-4 w-4 mr-2" />} Create Page
            </Button>
          </CardContent>
        </Card>
      )}

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {loading ? (
        <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
      ) : (
        <div className="space-y-2">
          {pages.map((page) => (
            <Card key={page.id} className="overflow-hidden hover:shadow-md transition-all">
              <div className="flex items-center gap-3 px-4 py-3 hover:bg-muted">
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => loadDetail(page.id)}>
                  {expandedId === page.id ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                </Button>
                <Layout className="h-4 w-4 text-muted-foreground shrink-0" />
                <Button variant="link" onClick={() => loadDetail(page.id)} className="flex-1 justify-start text-left text-sm font-medium text-foreground hover:text-primary p-0 h-auto">
                  {getTitle(page)}
                </Button>
                <span className="text-xs text-muted-foreground font-mono hidden sm:block">#{page.id}</span>
                <span className="text-xs text-muted-foreground hidden md:block">{page.date ? new Date(page.date).toLocaleDateString() : ''}</span>
                <Badge variant="secondary" className={page.status === 'publish' ? 'bg-emerald-900/30 text-emerald-400' : page.status === 'draft' ? 'bg-amber-900/30 text-amber-400' : 'bg-muted text-foreground'}>
                  {page.status}
                </Badge>
                <Button variant="ghost" size="icon" className="h-7 w-7 text-primary hover:bg-primary/10" onClick={() => openEdit(page)} title="Edit">
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-7 w-7 text-red-400 hover:bg-red-900/30" onClick={() => setDeleteTarget(page)} title="Delete">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>

              {expandedId === page.id && (
                <div className="border-t border-border bg-muted p-4 space-y-4">
                  {detailLoading ? (
                    <div className="flex justify-center py-4"><Loader2 className="h-5 w-5 animate-spin text-primary" /></div>
                  ) : detail ? (
                    <>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        <Card><CardContent className="p-3"><p className="text-xs text-muted-foreground">Status</p><Badge variant="secondary" className={detail.status === 'publish' ? 'bg-emerald-900/30 text-emerald-400' : 'bg-amber-900/30 text-amber-400'}>{detail.status}</Badge></CardContent></Card>
                        <Card><CardContent className="p-3"><p className="text-xs text-muted-foreground">Parent</p><p className="text-sm font-medium text-foreground">{detail.parent || 'None'}</p></CardContent></Card>
                        <Card><CardContent className="p-3"><p className="text-xs text-muted-foreground">Created</p><p className="text-sm font-medium text-foreground">{detail.date ? new Date(detail.date).toLocaleString() : '-'}</p></CardContent></Card>
                        <Card><CardContent className="p-3"><p className="text-xs text-muted-foreground">Modified</p><p className="text-sm font-medium text-foreground">{detail.modified ? new Date(detail.modified).toLocaleString() : '-'}</p></CardContent></Card>
                      </div>

                      <div className="flex gap-2 flex-wrap">
                        <Button variant="outline" size="sm" className="text-primary border-primary/30 hover:bg-primary/10" onClick={() => openEdit(detail)}>
                          <Pencil className="h-3.5 w-3.5 mr-2" /> Edit
                        </Button>
                        {detail.link && (
                          <Button variant="outline" size="sm" asChild>
                            <a href={detail.link} target="_blank" rel="noopener noreferrer"><Eye className="h-3.5 w-3.5 mr-2" /> View on site</a>
                          </Button>
                        )}
                      </div>

                      <JsonViewer data={detail} title="Page Data" />
                    </>
                  ) : null}
                </div>
              )}
            </Card>
          ))}
          {pages.length === 0 && <div className="text-center py-8 text-muted-foreground">No pages found</div>}
        </div>
      )}

      <Dialog open={!!editTarget} onOpenChange={(o) => !o && setEditTarget(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Edit Page</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <Input placeholder="Title" value={editTitle} onChange={(e) => setEditTitle(e.target.value)} />
            <Textarea placeholder="Content (HTML)" value={editContent} onChange={(e) => setEditContent(e.target.value)} rows={8} className="font-mono text-sm" />
            <Select value={editStatus} onValueChange={setEditStatus}>
              <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="publish">Publish</SelectItem>
                <SelectItem value="private">Private</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditTarget(null)}>Cancel</Button>
            <Button className="bg-emerald-600 hover:bg-emerald-700 text-white" onClick={handleUpdate} disabled={saving}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null} Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete Page"
        message={`Delete "${getTitle(deleteTarget)}"? This will move it to trash.`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
