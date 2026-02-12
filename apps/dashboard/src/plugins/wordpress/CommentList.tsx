import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { listComments, createComment, updateComment, deleteComment } from '../../lib/gateway-api';
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
  AlertCircle, X, MessageSquare, CheckCircle, Clock, ShieldAlert,
  Layers,
} from 'lucide-react';

const STATUS_COLORS: Record<string, string> = {
  approved: 'bg-green-900/30 text-green-400',
  hold: 'bg-amber-900/30 text-amber-400',
  spam: 'bg-red-900/30 text-red-400',
  trash: 'bg-muted text-muted-foreground',
};

export default function CommentList() {
  const activeConnection = usePluginConnection('wordpress');
  const connectionId = activeConnection?.id;
  const [comments, setComments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<any>(null);

  const [expandedId, setExpandedId] = useState<number | null>(null);

  const [showCreate, setShowCreate] = useState(false);
  const [createPostId, setCreatePostId] = useState('');
  const [createContent, setCreateContent] = useState('');
  const [createAuthor, setCreateAuthor] = useState('');
  const [createEmail, setCreateEmail] = useState('');
  const [creating, setCreating] = useState(false);

  const [statusUpdating, setStatusUpdating] = useState<number | null>(null);

  async function fetchList() {
    if (!connectionId) return;
    setLoading(true);
    setError('');
    const res = await listComments(connectionId);
    if (res.success && res.data) {
      const data = res.data as any;
      setComments(Array.isArray(data) ? data : data.data || []);
    } else {
      setError(res.error?.message || 'Failed to load comments');
    }
    setLoading(false);
  }

  useEffect(() => { if (connectionId) fetchList(); }, [connectionId]);

  async function handleCreate() {
    if (!connectionId || !createContent.trim() || !createPostId.trim()) return;
    setCreating(true);
    const res = await createComment(connectionId, {
      post: parseInt(createPostId),
      content: createContent,
      ...(createAuthor ? { author_name: createAuthor } : {}),
      ...(createEmail ? { author_email: createEmail } : {}),
    });
    if (res.success) {
      toast.success('Comment created');
      setShowCreate(false);
      setCreatePostId('');
      setCreateContent('');
      setCreateAuthor('');
      setCreateEmail('');
      fetchList();
    } else toast.error(res.error?.message || 'Create failed');
    setCreating(false);
  }

  async function handleStatusChange(comment: any, newStatus: string) {
    if (!connectionId) return;
    setStatusUpdating(comment.id);
    const res = await updateComment(connectionId, comment.id, { status: newStatus });
    if (res.success) {
      toast.success(`Comment ${newStatus === 'approved' ? 'approved' : newStatus}`);
      fetchList();
    } else toast.error(res.error?.message || 'Update failed');
    setStatusUpdating(null);
  }

  async function handleDelete() {
    if (!deleteTarget || !connectionId) return;
    const res = await deleteComment(connectionId, deleteTarget.id);
    if (res.success) {
      toast.success('Comment deleted');
      setDeleteTarget(null);
      if (expandedId === deleteTarget.id) setExpandedId(null);
      fetchList();
    } else toast.error(res.error?.message || 'Delete failed');
  }

  function getCommentText(comment: any) {
    const html = comment.content?.rendered || comment.content || '';
    const text = html.replace(/<[^>]*>/g, '').trim();
    return text.length > 80 ? text.slice(0, 80) + '...' : text;
  }

  if (!activeConnection) return <div className="text-center py-12 text-muted-foreground">No connection selected. Please select a connection from the sidebar.</div>;

  const approved = comments.filter(c => c.status === 'approved').length;
  const pending = comments.filter(c => c.status === 'hold' || c.status === 'pending').length;
  const spam = comments.filter(c => c.status === 'spam').length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Comments</h1>
          <p className="text-muted-foreground mt-1">{activeConnection.name} - {comments.length} comments</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setShowCreate(!showCreate)}>
            <Plus className="h-4 w-4 mr-2" /> Add
          </Button>
          <Button variant="outline" size="icon" onClick={fetchList} title="Refresh">
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {!loading && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-t from-primary/5 to-card shadow-sm">
            <CardHeader className="pb-2">
              <CardDescription>Total</CardDescription>
              <CardTitle className="text-2xl font-semibold tabular-nums">{comments.length}</CardTitle>
            </CardHeader>
            <CardFooter className="text-sm text-muted-foreground">
              <Layers className="h-3.5 w-3.5 mr-1.5 text-primary" /> All comments
            </CardFooter>
          </Card>
          <Card className="bg-gradient-to-t from-green-500/5 to-card shadow-sm">
            <CardHeader className="pb-2">
              <CardDescription>Approved</CardDescription>
              <CardTitle className="text-2xl font-semibold tabular-nums text-green-500">{approved}</CardTitle>
            </CardHeader>
            <CardFooter className="text-sm text-muted-foreground">
              <CheckCircle className="h-3.5 w-3.5 mr-1.5 text-green-500" /> Published
            </CardFooter>
          </Card>
          <Card className="bg-gradient-to-t from-amber-500/5 to-card shadow-sm">
            <CardHeader className="pb-2">
              <CardDescription>Pending</CardDescription>
              <CardTitle className="text-2xl font-semibold tabular-nums text-amber-500">{pending}</CardTitle>
            </CardHeader>
            <CardFooter className="text-sm text-muted-foreground">
              <Clock className="h-3.5 w-3.5 mr-1.5 text-amber-500" /> Awaiting review
            </CardFooter>
          </Card>
          <Card className="bg-gradient-to-t from-red-500/5 to-card shadow-sm">
            <CardHeader className="pb-2">
              <CardDescription>Spam</CardDescription>
              <CardTitle className="text-2xl font-semibold tabular-nums text-red-400">{spam}</CardTitle>
            </CardHeader>
            <CardFooter className="text-sm text-muted-foreground">
              <ShieldAlert className="h-3.5 w-3.5 mr-1.5 text-red-400" /> Flagged
            </CardFooter>
          </Card>
        </div>
      )}

      <Separator />

      {showCreate && (
        <Card className="hover:shadow-md transition-all">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Add Comment</CardTitle>
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setShowCreate(false)}><X className="h-4 w-4" /></Button>
            </div>
          </CardHeader>
          <CardContent className="pt-0 space-y-3">
            <Input placeholder="Post ID" value={createPostId} onChange={(e) => setCreatePostId(e.target.value)} type="number" />
            <Textarea placeholder="Comment content" value={createContent} onChange={(e) => setCreateContent(e.target.value)} rows={4} />
            <div className="grid grid-cols-2 gap-3">
              <Input placeholder="Author name (optional)" value={createAuthor} onChange={(e) => setCreateAuthor(e.target.value)} />
              <Input placeholder="Author email (optional)" value={createEmail} onChange={(e) => setCreateEmail(e.target.value)} type="email" />
            </div>
            <Button onClick={handleCreate} disabled={creating || !createContent.trim() || !createPostId.trim()}>
              {creating ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Plus className="h-4 w-4 mr-2" />} Add Comment
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
          {comments.map((comment) => (
            <Card key={comment.id} className="overflow-hidden hover:shadow-md transition-all">
              <div className="flex items-center gap-3 px-4 py-3 hover:bg-muted">
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setExpandedId(expandedId === comment.id ? null : comment.id)}>
                  {expandedId === comment.id ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                </Button>
                <MessageSquare className="h-4 w-4 text-muted-foreground shrink-0" />
                <div className="flex-1 min-w-0">
                  <Button variant="link" onClick={() => setExpandedId(expandedId === comment.id ? null : comment.id)} className="justify-start text-left text-sm font-medium text-foreground hover:text-primary p-0 h-auto w-full">
                    <span className="truncate block">{getCommentText(comment)}</span>
                  </Button>
                  <p className="text-xs text-muted-foreground">{comment.author_name || 'Anonymous'} on post #{comment.post}</p>
                </div>
                <Badge variant="secondary" className={STATUS_COLORS[comment.status] || 'bg-muted text-foreground'}>
                  {comment.status}
                </Badge>
                <Button variant="ghost" size="icon" className="h-7 w-7 text-red-400 hover:bg-red-900/30" onClick={() => setDeleteTarget(comment)} title="Delete">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>

              {expandedId === comment.id && (
                <div className="border-t border-border bg-muted p-4 space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <Card><CardContent className="p-3"><p className="text-xs text-muted-foreground">Author</p><p className="text-sm font-medium text-foreground">{comment.author_name || 'Anonymous'}</p></CardContent></Card>
                    <Card><CardContent className="p-3"><p className="text-xs text-muted-foreground">Email</p><p className="text-sm font-medium text-foreground truncate">{comment.author_email || '-'}</p></CardContent></Card>
                    <Card><CardContent className="p-3"><p className="text-xs text-muted-foreground">Post</p><p className="text-sm font-medium text-foreground">#{comment.post}</p></CardContent></Card>
                    <Card><CardContent className="p-3"><p className="text-xs text-muted-foreground">Date</p><p className="text-sm font-medium text-foreground">{comment.date ? new Date(comment.date).toLocaleString() : '-'}</p></CardContent></Card>
                  </div>

                  <Card>
                    <CardContent className="p-3">
                      <p className="text-xs text-muted-foreground mb-1">Content</p>
                      <div className="text-sm text-foreground prose prose-sm prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: comment.content?.rendered || comment.content || '' }} />
                    </CardContent>
                  </Card>

                  <div className="flex gap-2 flex-wrap">
                    {comment.status !== 'approved' && (
                      <Button variant="outline" size="sm" className="text-green-400 border-green-700 hover:bg-green-900/30" onClick={() => handleStatusChange(comment, 'approved')} disabled={statusUpdating === comment.id}>
                        {statusUpdating === comment.id ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-2" /> : <CheckCircle className="h-3.5 w-3.5 mr-2" />} Approve
                      </Button>
                    )}
                    {comment.status !== 'hold' && (
                      <Button variant="outline" size="sm" className="text-amber-400 border-amber-700 hover:bg-amber-900/30" onClick={() => handleStatusChange(comment, 'hold')} disabled={statusUpdating === comment.id}>
                        Hold
                      </Button>
                    )}
                    {comment.status !== 'spam' && (
                      <Button variant="outline" size="sm" className="text-red-400 border-red-700 hover:bg-red-900/30" onClick={() => handleStatusChange(comment, 'spam')} disabled={statusUpdating === comment.id}>
                        <ShieldAlert className="h-3.5 w-3.5 mr-2" /> Spam
                      </Button>
                    )}
                  </div>

                  <JsonViewer data={comment} title="Comment Data" />
                </div>
              )}
            </Card>
          ))}
          {comments.length === 0 && <div className="text-center py-8 text-muted-foreground">No comments found</div>}
        </div>
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete Comment"
        message={`Delete this comment by "${deleteTarget?.author_name || 'Anonymous'}"? This cannot be undone.`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
