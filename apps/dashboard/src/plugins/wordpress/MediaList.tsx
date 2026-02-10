import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { listMedia, deleteMedia } from '../../lib/gateway-api';
import {
  useConnection, Button, Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter,
  Badge, Separator, Alert, AlertDescription,
} from '@node2flow/dashboard-core';
import JsonViewer from '../n8n/components/JsonViewer';
import ConfirmDialog from '../n8n/components/ConfirmDialog';
import {
  Loader2, RefreshCw, ChevronDown, ChevronRight, Trash2,
  AlertCircle, Clock, Image, FileVideo, FileAudio, File,
  Layers,
} from 'lucide-react';

function MediaIcon({ type }: { type?: string }) {
  if (!type) return <File className="h-4 w-4 text-muted-foreground" />;
  if (type.startsWith('image')) return <Image className="h-4 w-4 text-purple-400" />;
  if (type.startsWith('video')) return <FileVideo className="h-4 w-4 text-blue-400" />;
  if (type.startsWith('audio')) return <FileAudio className="h-4 w-4 text-amber-400" />;
  return <File className="h-4 w-4 text-muted-foreground" />;
}

export default function MediaList() {
  const { activeConnection } = useConnection();
  const connectionId = activeConnection?.id;
  const [media, setMedia] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<any>(null);

  const [expandedId, setExpandedId] = useState<number | null>(null);

  async function fetchList() {
    if (!connectionId) return;
    setLoading(true);
    setError('');
    const res = await listMedia(connectionId);
    if (res.success && res.data) {
      const data = res.data as any;
      setMedia(Array.isArray(data) ? data : data.data || []);
    } else {
      setError(res.error?.message || 'Failed to load media');
    }
    setLoading(false);
  }

  useEffect(() => { if (connectionId) fetchList(); }, [connectionId]);

  async function handleDelete() {
    if (!deleteTarget || !connectionId) return;
    const res = await deleteMedia(connectionId, deleteTarget.id);
    if (res.success) {
      toast.success('Media deleted');
      setDeleteTarget(null);
      if (expandedId === deleteTarget.id) setExpandedId(null);
      fetchList();
    } else toast.error(res.error?.message || 'Delete failed');
  }

  function getTitle(item: any) {
    return item?.title?.rendered || item?.title || item?.slug || 'Untitled';
  }

  function getMediaType(item: any) {
    return item.media_type || item.mime_type?.split('/')[0] || 'file';
  }

  if (!activeConnection) return <div className="text-center py-12 text-muted-foreground">No connection selected. Please select a connection from the sidebar.</div>;

  const images = media.filter(m => (m.media_type || m.mime_type || '').includes('image')).length;
  const others = media.length - images;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Media Library</h1>
          <p className="text-muted-foreground mt-1">{activeConnection.name} - {media.length} items</p>
        </div>
        <Button variant="outline" size="icon" onClick={fetchList} title="Refresh">
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>

      {!loading && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <Card className="bg-gradient-to-t from-primary/5 to-card shadow-sm">
            <CardHeader className="pb-2">
              <CardDescription>Total Media</CardDescription>
              <CardTitle className="text-2xl font-semibold tabular-nums">{media.length}</CardTitle>
            </CardHeader>
            <CardFooter className="text-sm text-muted-foreground">
              <Layers className="h-3.5 w-3.5 mr-1.5 text-primary" /> All files
            </CardFooter>
          </Card>
          <Card className="bg-gradient-to-t from-purple-500/5 to-card shadow-sm">
            <CardHeader className="pb-2">
              <CardDescription>Images</CardDescription>
              <CardTitle className="text-2xl font-semibold tabular-nums text-purple-400">{images}</CardTitle>
            </CardHeader>
            <CardFooter className="text-sm text-muted-foreground">
              <Image className="h-3.5 w-3.5 mr-1.5 text-purple-400" /> Photos & graphics
            </CardFooter>
          </Card>
          <Card className="bg-gradient-to-t from-amber-500/5 to-card shadow-sm">
            <CardHeader className="pb-2">
              <CardDescription>Other Files</CardDescription>
              <CardTitle className="text-2xl font-semibold tabular-nums text-amber-500">{others}</CardTitle>
            </CardHeader>
            <CardFooter className="text-sm text-muted-foreground">
              <File className="h-3.5 w-3.5 mr-1.5 text-amber-500" /> Videos, docs, etc.
            </CardFooter>
          </Card>
        </div>
      )}

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
        <div className="space-y-2">
          {media.map((item) => (
            <Card key={item.id} className="overflow-hidden hover:shadow-md transition-all">
              <div className="flex items-center gap-3 px-4 py-3 hover:bg-muted">
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setExpandedId(expandedId === item.id ? null : item.id)}>
                  {expandedId === item.id ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                </Button>
                <MediaIcon type={item.mime_type} />
                <Button variant="link" onClick={() => setExpandedId(expandedId === item.id ? null : item.id)} className="flex-1 justify-start text-left text-sm font-medium text-foreground hover:text-primary p-0 h-auto">
                  {getTitle(item)}
                </Button>
                <span className="text-xs text-muted-foreground font-mono hidden sm:block">#{item.id}</span>
                <Badge variant="secondary" className="bg-muted text-foreground">{getMediaType(item)}</Badge>
                <span className="text-xs text-muted-foreground hidden md:block">{item.date ? new Date(item.date).toLocaleDateString() : ''}</span>
                <Button variant="ghost" size="icon" className="h-7 w-7 text-red-400 hover:bg-red-900/30" onClick={() => setDeleteTarget(item)} title="Delete">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>

              {expandedId === item.id && (
                <div className="border-t border-border bg-muted p-4 space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <Card><CardContent className="p-3"><p className="text-xs text-muted-foreground">Type</p><p className="text-sm font-medium text-foreground">{item.mime_type || '-'}</p></CardContent></Card>
                    <Card><CardContent className="p-3"><p className="text-xs text-muted-foreground">Date</p><p className="text-sm font-medium text-foreground">{item.date ? new Date(item.date).toLocaleString() : '-'}</p></CardContent></Card>
                    <Card><CardContent className="p-3"><p className="text-xs text-muted-foreground">Alt Text</p><p className="text-sm font-medium text-foreground">{item.alt_text || '-'}</p></CardContent></Card>
                    <Card><CardContent className="p-3"><p className="text-xs text-muted-foreground">File Size</p><p className="text-sm font-medium text-foreground">{item.media_details?.filesize ? `${Math.round(item.media_details.filesize / 1024)} KB` : '-'}</p></CardContent></Card>
                  </div>

                  {item.source_url && (item.mime_type || '').startsWith('image') && (
                    <Card>
                      <CardContent className="p-3">
                        <p className="text-xs text-muted-foreground mb-2">Preview</p>
                        <img src={item.source_url} alt={item.alt_text || getTitle(item)} className="max-h-64 rounded border border-border object-contain" />
                      </CardContent>
                    </Card>
                  )}

                  {item.source_url && (
                    <Button variant="outline" size="sm" asChild>
                      <a href={item.source_url} target="_blank" rel="noopener noreferrer">Open original file</a>
                    </Button>
                  )}

                  <JsonViewer data={item} title="Media Data" />
                </div>
              )}
            </Card>
          ))}
          {media.length === 0 && <div className="text-center py-8 text-muted-foreground">No media found</div>}
        </div>
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete Media"
        message={`Permanently delete "${getTitle(deleteTarget)}"? This cannot be undone.`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
