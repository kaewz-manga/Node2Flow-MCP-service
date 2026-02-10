import { useState } from 'react';
import { toast } from 'sonner';
import { notionGetBlockChildren, notionAppendBlocks, notionDeleteBlock } from '../../lib/gateway-api';
import { usePluginConnection, Button, Input, Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter, Alert, AlertDescription, Separator, Badge } from '@node2flow/dashboard-core';

import ConfirmDialog from '../n8n/components/ConfirmDialog';
import JsonViewer from '../n8n/components/JsonViewer';
import { Loader2, RefreshCw, AlertCircle, Box, Plus, Trash2, ChevronRight, ChevronDown, Search } from 'lucide-react';

export default function BlockList() {
  const activeConnection = usePluginConnection('notion');
  const connectionId = activeConnection?.id;
  const [blocks, setBlocks] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [blockId, setBlockId] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<any>(null);

  // Append block state
  const [appendBlockId, setAppendBlockId] = useState('');
  const [appendType, setAppendType] = useState('paragraph');
  const [appendText, setAppendText] = useState('');
  const [appending, setAppending] = useState(false);

  async function fetch() {
    if (!blockId.trim() || !connectionId) return;
    setLoading(true);
    setError('');
    const res = await notionGetBlockChildren(connectionId, blockId.trim());
    if (res.success && res.data) {
      const d = res.data as any;
      const results = d.results || [];
      setBlocks(results);
    } else {
      setError(res.error?.message || 'Failed');
      setBlocks([]);
    }
    setLoading(false);
  }

  async function handleDelete() {
    if (!deleteTarget || !connectionId) return;
    const res = await notionDeleteBlock(connectionId, deleteTarget.id);
    if (res.success) {
      setDeleteTarget(null);
      toast.success('Block deleted');
      fetch();
    } else {
      toast.error(res.error?.message || 'Failed to delete block');
    }
  }

  async function handleAppend() {
    if (!appendBlockId.trim() || !appendText.trim() || !connectionId) return;
    setAppending(true);

    // Build block object based on type
    let blockObject: any = {
      object: 'block',
      type: appendType,
    };

    // For most text-based blocks
    if (['paragraph', 'heading_1', 'heading_2', 'bulleted_list_item', 'numbered_list_item', 'to_do'].includes(appendType)) {
      blockObject[appendType] = {
        rich_text: [{ type: 'text', text: { content: appendText } }]
      };
      if (appendType === 'to_do') {
        blockObject[appendType].checked = false;
      }
    }

    const res = await notionAppendBlocks(connectionId, appendBlockId.trim(), [blockObject]);
    if (res.success) {
      toast.success('Block appended');
      setAppendText('');
      if (appendBlockId.trim() === blockId.trim()) {
        fetch();
      }
    } else {
      toast.error(res.error?.message || 'Failed to append block');
    }
    setAppending(false);
  }

  if (!activeConnection) return <div className="text-center py-12 text-muted-foreground">No connection selected. Please select a connection from the sidebar.</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Blocks</h1>
          <p className="text-muted-foreground mt-1">{activeConnection.name}</p>
        </div>
        <Button variant="outline" size="icon" onClick={fetch} title="Refresh" disabled={!blockId.trim()}>
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>

      {/* Load Blocks */}
      <Card>
        <CardHeader>
          <CardTitle>Load Blocks</CardTitle>
          <CardDescription>Enter a page or block ID to load its children blocks</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex gap-2">
            <Input
              value={blockId}
              onChange={(e) => setBlockId(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') fetch(); }}
              placeholder="Page/Block ID..."
              className="flex-1"
            />
            <Button className="bg-emerald-600 hover:bg-emerald-700 text-white" onClick={fetch} disabled={loading || !blockId.trim()}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Search className="h-4 w-4 mr-2" />} Load Blocks
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Stat Cards */}
      {blocks.length > 0 && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <Card className="bg-gradient-to-t from-primary/5 to-card shadow-sm">
              <CardHeader className="pb-2">
                <CardDescription>Total Blocks</CardDescription>
                <CardTitle className="text-2xl font-semibold tabular-nums">{blocks.length}</CardTitle>
              </CardHeader>
              <CardFooter className="text-sm text-muted-foreground">
                <Box className="h-3.5 w-3.5 mr-1.5 text-primary" />
                Blocks loaded
              </CardFooter>
            </Card>
            <Card className="bg-gradient-to-t from-emerald-500/5 to-card shadow-sm">
              <CardHeader className="pb-2">
                <CardDescription>Block Types</CardDescription>
                <CardTitle className="text-lg font-semibold">
                  {new Set(blocks.map(b => b.type)).size}
                </CardTitle>
              </CardHeader>
              <CardFooter className="text-sm text-muted-foreground">
                <Box className="h-3.5 w-3.5 mr-1.5 text-emerald-500" />
                Unique types
              </CardFooter>
            </Card>
            <Card className="bg-gradient-to-t from-amber-500/5 to-card shadow-sm">
              <CardHeader className="pb-2">
                <CardDescription>Has Children</CardDescription>
                <CardTitle className="text-lg font-semibold tabular-nums">
                  {blocks.filter(b => b.has_children).length}
                </CardTitle>
              </CardHeader>
              <CardFooter className="text-sm text-muted-foreground">
                <Box className="h-3.5 w-3.5 mr-1.5 text-amber-500" />
                Nested blocks
              </CardFooter>
            </Card>
          </div>
          <Separator />
        </>
      )}

      {/* Append Block */}
      <Card>
        <CardHeader>
          <CardTitle>Append Block</CardTitle>
          <CardDescription>Add a new block to a page or block</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex gap-2">
            <Input
              value={appendBlockId}
              onChange={(e) => setAppendBlockId(e.target.value)}
              placeholder="Target Page/Block ID..."
              className="flex-1"
            />
            <select
              value={appendType}
              onChange={(e) => setAppendType(e.target.value)}
              className="px-3 py-2 bg-background border border-input rounded-md text-sm"
            >
              <option value="paragraph">Paragraph</option>
              <option value="heading_1">Heading 1</option>
              <option value="heading_2">Heading 2</option>
              <option value="to_do">To Do</option>
              <option value="bulleted_list_item">Bulleted List</option>
              <option value="numbered_list_item">Numbered List</option>
            </select>
          </div>
          <div className="flex gap-2">
            <Input
              value={appendText}
              onChange={(e) => setAppendText(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') handleAppend(); }}
              placeholder="Block text content..."
              className="flex-1"
            />
            <Button
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
              onClick={handleAppend}
              disabled={appending || !appendBlockId.trim() || !appendText.trim()}
            >
              {appending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Plus className="h-4 w-4 mr-2" />} Append
            </Button>
          </div>
        </CardContent>
      </Card>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {loading ? (
        <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
      ) : (
        <div className="space-y-3">
          {blocks.map((block) => (
            <Card key={block.id} className="hover:shadow-md transition-all">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <Box className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">{block.type}</Badge>
                          {block.has_children && <Badge variant="secondary" className="text-xs">Has Children</Badge>}
                        </div>
                        <p className="text-xs text-muted-foreground font-mono mt-1">ID: {block.id}</p>
                      </div>
                      <div className="flex gap-1 shrink-0">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setExpandedId(expandedId === block.id ? null : block.id)}
                        >
                          {expandedId === block.id ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 hover:text-red-400 hover:bg-red-900/30"
                          onClick={() => setDeleteTarget(block)}
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    {expandedId === block.id && (
                      <div className="mt-4">
                        <h4 className="text-sm font-medium text-foreground mb-2">Block Content</h4>
                        <JsonViewer data={block} />
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          {blocks.length === 0 && !loading && (
            <div className="text-center py-8 text-muted-foreground">
              {blockId.trim() ? 'No blocks found for this ID' : 'Enter a page or block ID to load blocks'}
            </div>
          )}
        </div>
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete Block"
        message={`Delete block of type "${deleteTarget?.type}"? This action cannot be undone.`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
