import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { listPosts, getPost, createPost, updatePost, deletePost } from '../../lib/gateway-api';
import {
  usePluginConnection, Button, Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter,
  Input, Textarea, Badge, Separator, Alert, AlertDescription,
  Dialog, DialogContent, DialogHeader, DialogFooter, DialogTitle,
  Select, SelectTrigger, SelectValue, SelectContent, SelectItem,
} from '@node2flow/dashboard-core';
import JsonViewer from '../n8n/components/JsonViewer';
import ConfirmDialog from '../n8n/components/ConfirmDialog';
import {
  Loader2, Plus, RefreshCw, ChevronDown, ChevronRight, Trash2,
  Pencil, AlertCircle, Eye, Clock, X,
  Layers, CheckCircle, FileEdit,
} from 'lucide-react';

export default function PostList() {
  const activeConnection = usePluginConnection('wordpress');
  const connectionId = activeConnection?.id;
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<any>(null);

  // Expanded detail
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [detail, setDetail] = useState<any>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  // Create
  const [showCreate, setShowCreate] = useState(false);
  const [createTitle, setCreateTitle] = useState('');
  const [createContent, setCreateContent] = useState('');
  const [createStatus, setCreateStatus] = useState('draft');
  const [creating, setCreating] = useState(false);

  // Edit
  const [editTarget, setEditTarget] = useState<any>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');
  const [editStatus, setEditStatus] = useState('');
  const [saving, setSaving] = useState(false);

  async function fetchList() {
    if (!connectionId) return;
    setLoading(true);
    setError('');
    const res = await listPosts(connectionId);
    if (res.success && res.data) {
      const data = res.data as any;
      setPosts(Array.isArray(data) ? data : data.data || []);
    } else {
      setError(res.error?.message || 'Failed to load posts');
    }
    setLoading(false);
  }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { if (connectionId) fetchList(); }, [connectionId]);

  async function loadDetail(id: number) {
    if (!connectionId) return;
    if (expandedId === id) { setExpandedId(null); return; }
    setExpandedId(id);
    setDetailLoading(true);
    const res = await getPost(connectionId, id);
    if (res.success && res.data) setDetail(res.data);
    setDetailLoading(false);
  }

  async function handleCreate() {
    if (!connectionId || !createTitle.trim()) return;
    setCreating(true);
    const res = await createPost(connectionId, { title: createTitle, content: createContent, status: createStatus });
    if (res.success) {
      toast.success('Post created');
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
    const res = await updatePost(connectionId, editTarget.id, { title: editTitle, content: editContent, status: editStatus });
    if (res.success) {
      toast.success('Post updated');
      setEditTarget(null);
      fetchList();
      if (expandedId === editTarget.id) loadDetail(editTarget.id);
    } else toast.error(res.error?.message || 'Update failed');
    setSaving(false);
  }

  async function handleDelete() {
    if (!deleteTarget || !connectionId) return;
    const res = await deletePost(connectionId, deleteTarget.id);
    if (res.success) {
      toast.success('Post deleted');
      setDeleteTarget(null);
      if (expandedId === deleteTarget.id) setExpandedId(null);
      fetchList();
    } else toast.error(res.error?.message || 'Delete failed');
  }

  function openEdit(post: any) {
    setEditTarget(post);
    setEditTitle(post.title?.rendered || post.title || '');
    setEditContent(post.content?.rendered || post.content || '');
    setEditStatus(post.status || 'draft');
  }

  function getTitle(post: any) {
    return post?.title?.rendered || post?.title || 'Untitled';
  }

  if (!activeConnection) return <div className="text-center py-12 text-muted-foreground">No connection selected. Please select a connection from the sidebar.</div>;

  const published = posts.filter(p => p.status === 'publish').length;
  const drafts = posts.filter(p => p.status === 'draft').length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Posts</h1>
          <p className="text-muted-foreground mt-1">{activeConnection.name} - {posts.length} posts</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setShowCreate(!showCreate)}>
            <Plus className="h-4 w-4 mr-2" /> Create
          </Button>
          <Button variant="outline" size="icon" onClick={fetchList} title="Refresh">
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Stat Cards */}
      {!loading && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-t from-primary/5 to-card shadow-sm">
            <CardHeader className="pb-2">
              <CardDescription>Total Posts</CardDescription>
              <CardTitle className="text-2xl font-semibold tabular-nums">{posts.length}</CardTitle>
            </CardHeader>
            <CardFooter className="text-sm text-muted-foreground">
              <Layers className="h-3.5 w-3.5 mr-1.5 text-primary" /> All posts
            </CardFooter>
          </Card>
          <Card className="bg-gradient-to-t from-green-500/5 to-card shadow-sm">
            <CardHeader className="pb-2">
              <CardDescription>Published</CardDescription>
              <CardTitle className="text-2xl font-semibold tabular-nums text-green-500">{published}</CardTitle>
            </CardHeader>
            <CardFooter className="text-sm text-muted-foreground">
              <CheckCircle className="h-3.5 w-3.5 mr-1.5 text-green-500" /> Live
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
          <Card className="bg-gradient-to-t from-primary/5 to-card shadow-sm">
            <CardHeader className="pb-2">
              <CardDescription>Last Modified</CardDescription>
              <CardTitle className="text-lg font-semibold tabular-nums">
                {posts.length > 0
                  ? new Date(posts.reduce((a, b) => (a.modified || a.date || '') > (b.modified || b.date || '') ? a : b).modified || posts[0].date || '').toLocaleDateString()
                  : '-'}
              </CardTitle>
            </CardHeader>
            <CardFooter className="text-sm text-muted-foreground">
              <Clock className="h-3.5 w-3.5 mr-1.5 text-primary" /> Most recent
            </CardFooter>
          </Card>
        </div>
      )}

      <Separator />

      {/* Create form */}
      {showCreate && (
        <Card className="hover:shadow-md transition-all">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Create Post</CardTitle>
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setShowCreate(false)}><X className="h-4 w-4" /></Button>
            </div>
          </CardHeader>
          <CardContent className="pt-0 space-y-3">
            <Input placeholder="Post title" value={createTitle} onChange={(e) => setCreateTitle(e.target.value)} />
            <Textarea placeholder="Post content (HTML)" value={createContent} onChange={(e) => setCreateContent(e.target.value)} rows={8} className="font-mono text-sm" />
            <Select value={createStatus} onValueChange={setCreateStatus}>
              <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="publish">Publish</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="private">Private</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={handleCreate} disabled={creating || !createTitle.trim()}>
              {creating ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Plus className="h-4 w-4 mr-2" />} Create Post
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
          {posts.map((post) => (
            <Card key={post.id} className="overflow-hidden hover:shadow-md transition-all">
              <div className="flex items-center gap-3 px-4 py-3 hover:bg-muted">
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => loadDetail(post.id)}>
                  {expandedId === post.id ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                </Button>
                <Button variant="link" onClick={() => loadDetail(post.id)} className="flex-1 justify-start text-left text-sm font-medium text-foreground hover:text-primary p-0 h-auto">
                  {getTitle(post)}
                </Button>
                <span className="text-xs text-muted-foreground font-mono hidden sm:block">#{post.id}</span>
                <span className="text-xs text-muted-foreground hidden md:block">{post.date ? new Date(post.date).toLocaleDateString() : ''}</span>
                <Badge variant="secondary" className={post.status === 'publish' ? 'bg-green-900/30 text-green-400' : post.status === 'draft' ? 'bg-amber-900/30 text-amber-400' : 'bg-muted text-foreground'}>
                  {post.status}
                </Badge>
                <Button variant="ghost" size="icon" className="h-7 w-7 text-primary hover:bg-primary/10" onClick={() => openEdit(post)} title="Edit">
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-7 w-7 text-red-400 hover:bg-red-900/30" onClick={() => setDeleteTarget(post)} title="Delete">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>

              {expandedId === post.id && (
                <div className="border-t border-border bg-muted p-4 space-y-4">
                  {detailLoading ? (
                    <div className="flex justify-center py-4"><Loader2 className="h-5 w-5 animate-spin text-primary" /></div>
                  ) : detail ? (
                    <>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        <Card><CardContent className="p-3"><p className="text-xs text-muted-foreground">Status</p><Badge variant="secondary" className={detail.status === 'publish' ? 'bg-green-900/30 text-green-400' : 'bg-amber-900/30 text-amber-400'}>{detail.status}</Badge></CardContent></Card>
                        <Card><CardContent className="p-3"><p className="text-xs text-muted-foreground">Author</p><p className="text-sm font-medium text-foreground">{detail.author || '-'}</p></CardContent></Card>
                        <Card><CardContent className="p-3"><p className="text-xs text-muted-foreground">Created</p><p className="text-sm font-medium text-foreground">{detail.date ? new Date(detail.date).toLocaleString() : '-'}</p></CardContent></Card>
                        <Card><CardContent className="p-3"><p className="text-xs text-muted-foreground">Modified</p><p className="text-sm font-medium text-foreground">{detail.modified ? new Date(detail.modified).toLocaleString() : '-'}</p></CardContent></Card>
                      </div>

                      {(detail.excerpt?.rendered || detail.excerpt) && (
                        <Card>
                          <CardContent className="p-3">
                            <p className="text-xs text-muted-foreground mb-1">Excerpt</p>
                            <div className="text-sm text-foreground" dangerouslySetInnerHTML={{ __html: detail.excerpt?.rendered || detail.excerpt || '' }} />
                          </CardContent>
                        </Card>
                      )}

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

                      <JsonViewer data={detail} title="Post Data" />
                    </>
                  ) : null}
                </div>
              )}
            </Card>
          ))}
          {posts.length === 0 && <div className="text-center py-8 text-muted-foreground">No posts found</div>}
        </div>
      )}

      {/* Edit Dialog */}
      <Dialog open={!!editTarget} onOpenChange={(o) => !o && setEditTarget(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Edit Post</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <Input placeholder="Title" value={editTitle} onChange={(e) => setEditTitle(e.target.value)} />
            <Textarea placeholder="Content (HTML)" value={editContent} onChange={(e) => setEditContent(e.target.value)} rows={8} className="font-mono text-sm" />
            <Select value={editStatus} onValueChange={setEditStatus}>
              <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="publish">Publish</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="private">Private</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditTarget(null)}>Cancel</Button>
            <Button onClick={handleUpdate} disabled={saving}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null} Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete Post"
        message={`Delete "${getTitle(deleteTarget)}"? This will move it to trash.`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
