import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import {
  listWorkflows, getWorkflow, createWorkflow, updateWorkflow, deleteWorkflow,
  activateWorkflow, deactivateWorkflow, executeWorkflow,
  getWorkflowTags, updateWorkflowTags, listTags,
} from '../../lib/gateway-api';
import { usePluginConnection, Button, Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter, Textarea, Alert, AlertDescription, Badge, Separator } from '@node2flow/dashboard-core';

import StatusBadge from './components/StatusBadge';
import JsonViewer from './components/JsonViewer';
import ConfirmDialog from './components/ConfirmDialog';
import {
  Loader2, Play, Trash2, RefreshCw, Plus, AlertCircle,
  Power, PowerOff, ChevronDown, ChevronRight, X, Save, Pencil, Tag,
  Layers, Zap, ZapOff, Clock,
} from 'lucide-react';

const PAGE_SIZE = 20;

export default function WorkflowList() {
  const activeConnection = usePluginConnection('n8n');
  const connectionId = activeConnection?.id;
  const [workflows, setWorkflows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<any>(null);
  const [executing, setExecuting] = useState<string | null>(null);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [loadingMore, setLoadingMore] = useState(false);

  // Expanded detail
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [detail, setDetail] = useState<any>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailTags, setDetailTags] = useState<any[]>([]);

  // Edit mode
  const [editing, setEditing] = useState(false);
  const [editJson, setEditJson] = useState('');
  const [saving, setSaving] = useState(false);

  // Tag editing
  const [editingTags, setEditingTags] = useState(false);
  const [allTags, setAllTags] = useState<any[]>([]);
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);
  const [savingTags, setSavingTags] = useState(false);

  // Create workflow
  const [showCreate, setShowCreate] = useState(false);
  const [createJson, setCreateJson] = useState('{\n  "name": "New Workflow",\n  "nodes": [],\n  "connections": {},\n  "settings": {\n    "executionOrder": "v1"\n  }\n}');
  const [creating, setCreating] = useState(false);

  async function fetchList() {
    if (!connectionId) return;
    setLoading(true);
    setError('');
    const res = await listWorkflows(connectionId, PAGE_SIZE);
    if (res.success && res.data) {
      const data = res.data as any;
      setWorkflows(Array.isArray(data) ? data : data.data || []);
      setNextCursor(data.nextCursor || null);
    } else {
      setError(res.error?.message || 'Failed to load');
    }
    setLoading(false);
  }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { if (connectionId) fetchList(); }, [connectionId]);

  async function handleLoadMore() {
    if (!connectionId || !nextCursor) return;
    setLoadingMore(true);
    const res = await listWorkflows(connectionId, PAGE_SIZE, nextCursor);
    if (res.success && res.data) {
      const data = res.data as any;
      const newItems = Array.isArray(data) ? data : data.data || [];
      setWorkflows(prev => [...prev, ...newItems]);
      setNextCursor(data.nextCursor || null);
    } else {
      toast.error(res.error?.message || 'Failed to load more');
    }
    setLoadingMore(false);
  }

  async function loadDetail(id: string) {
    if (!connectionId) return;
    if (expandedId === id) { setExpandedId(null); return; }
    setExpandedId(id);
    setDetailLoading(true);
    setEditing(false);
    setEditingTags(false);
    const [wfRes, tagRes] = await Promise.all([getWorkflow(connectionId, id), getWorkflowTags(connectionId, id)]);
    if (wfRes.success && wfRes.data) {
      setDetail(wfRes.data);
      setEditJson(JSON.stringify(wfRes.data, null, 2));
    }
    if (tagRes.success && tagRes.data) {
      const d = tagRes.data as any;
      setDetailTags(Array.isArray(d) ? d : d.data || []);
    }
    setDetailLoading(false);
  }

  async function handleToggle(wf: any) {
    if (!connectionId) return;
    const fn = wf.active ? deactivateWorkflow : activateWorkflow;
    const res = await fn(connectionId, wf.id);
    if (res.success) fetchList();
    else toast.error(res.error?.message || 'Failed');
  }

  async function handleExecute(id: string) {
    if (!connectionId) return;
    setExecuting(id);
    const res = await executeWorkflow(connectionId, id);
    setExecuting(null);
    if (res.success) toast.success('Executed successfully');
    else toast.error(res.error?.message || 'Execution failed');
  }

  async function handleDelete() {
    if (!deleteTarget || !connectionId) return;
    const res = await deleteWorkflow(connectionId, deleteTarget.id);
    if (res.success) {
      setDeleteTarget(null);
      if (expandedId === deleteTarget.id) setExpandedId(null);
      fetchList();
    } else toast.error(res.error?.message || 'Failed');
  }

  async function handleUpdate() {
    if (!detail || !connectionId) return;
    setSaving(true);
    try {
      const data = JSON.parse(editJson);
      const res = await updateWorkflow(connectionId, detail.id, data);
      if (res.success) {
        setEditing(false);
        loadDetail(detail.id);
        setExpandedId(null);
        setTimeout(() => loadDetail(detail.id), 100);
        fetchList();
      } else toast.error(res.error?.message || 'Update failed');
    } catch { toast.error('Invalid JSON'); }
    setSaving(false);
  }

  async function handleCreate() {
    if (!connectionId) return;
    setCreating(true);
    try {
      const data = JSON.parse(createJson);
      const res = await createWorkflow(connectionId, data);
      if (res.success) {
        setShowCreate(false);
        setCreateJson('{\n  "name": "New Workflow",\n  "nodes": [],\n  "connections": {},\n  "settings": {\n    "executionOrder": "v1"\n  }\n}');
        fetchList();
      } else toast.error(res.error?.message || 'Create failed');
    } catch { toast.error('Invalid JSON'); }
    setCreating(false);
  }

  async function startEditTags() {
    if (!connectionId) return;
    setEditingTags(true);
    const res = await listTags(connectionId);
    if (res.success && res.data) {
      const d = res.data as any;
      setAllTags(Array.isArray(d) ? d : d.data || []);
    }
    setSelectedTagIds(detailTags.map((t: any) => String(t.id)));
  }

  async function handleSaveTags() {
    if (!detail || !connectionId) return;
    setSavingTags(true);
    const res = await updateWorkflowTags(connectionId, detail.id, selectedTagIds);
    if (res.success) {
      setEditingTags(false);
      const tagRes = await getWorkflowTags(connectionId, detail.id);
      if (tagRes.success && tagRes.data) {
        const d = tagRes.data as any;
        setDetailTags(Array.isArray(d) ? d : d.data || []);
      }
    } else toast.error(res.error?.message || 'Failed');
    setSavingTags(false);
  }

  function toggleTagId(id: string) {
    setSelectedTagIds(prev => prev.includes(id) ? prev.filter(t => t !== id) : [...prev, id]);
  }

  if (!activeConnection) return <div className="text-center py-12 text-muted-foreground">No connection selected. Please select a connection from the sidebar.</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Workflows</h1>
          <p className="text-muted-foreground mt-1">
            {activeConnection.name} - {workflows.length} loaded{nextCursor ? ' (more available)' : ' workflows'}
          </p>
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
              <CardDescription>Total Workflows</CardDescription>
              <CardTitle className="text-2xl font-semibold tabular-nums">{workflows.length}</CardTitle>
            </CardHeader>
            <CardFooter className="text-sm text-muted-foreground">
              <Layers className="h-3.5 w-3.5 mr-1.5 text-primary" />
              All workflows
            </CardFooter>
          </Card>
          <Card className="bg-gradient-to-t from-green-500/5 to-card shadow-sm">
            <CardHeader className="pb-2">
              <CardDescription>Active</CardDescription>
              <CardTitle className="text-2xl font-semibold tabular-nums text-green-500">{workflows.filter(w => w.active).length}</CardTitle>
            </CardHeader>
            <CardFooter className="text-sm text-muted-foreground">
              <Zap className="h-3.5 w-3.5 mr-1.5 text-green-500" />
              Currently running
            </CardFooter>
          </Card>
          <Card className="bg-gradient-to-t from-amber-500/5 to-card shadow-sm">
            <CardHeader className="pb-2">
              <CardDescription>Inactive</CardDescription>
              <CardTitle className="text-2xl font-semibold tabular-nums text-amber-500">{workflows.filter(w => !w.active).length}</CardTitle>
            </CardHeader>
            <CardFooter className="text-sm text-muted-foreground">
              <ZapOff className="h-3.5 w-3.5 mr-1.5 text-amber-500" />
              Paused
            </CardFooter>
          </Card>
          <Card className="bg-gradient-to-t from-primary/5 to-card shadow-sm">
            <CardHeader className="pb-2">
              <CardDescription>Last Updated</CardDescription>
              <CardTitle className="text-lg font-semibold tabular-nums">
                {workflows.length > 0
                  ? new Date(workflows.reduce((a, b) =>
                      (a.updatedAt || '') > (b.updatedAt || '') ? a : b
                    ).updatedAt || '').toLocaleDateString()
                  : '-'}
              </CardTitle>
            </CardHeader>
            <CardFooter className="text-sm text-muted-foreground">
              <Clock className="h-3.5 w-3.5 mr-1.5 text-primary" />
              Most recent change
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
              <CardTitle className="text-base">Create Workflow</CardTitle>
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setShowCreate(false)}><X className="h-4 w-4" /></Button>
            </div>
          </CardHeader>
          <CardContent className="pt-0 space-y-3">
            <Textarea
              value={createJson}
              onChange={(e) => setCreateJson(e.target.value)}
              rows={12}
              className="font-mono text-sm"
            />
            <Button variant="secondary" onClick={handleCreate} disabled={creating}>
              {creating ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Plus className="h-4 w-4 mr-2" />} Create Workflow
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
          {workflows.map((wf) => (
            <Card key={wf.id} className="overflow-hidden hover:shadow-md transition-all">
              {/* Row */}
              <div className="flex items-center gap-3 px-4 py-3 hover:bg-muted">
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => loadDetail(wf.id)}>
                  {expandedId === wf.id ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                </Button>
                <Button variant="link" onClick={() => loadDetail(wf.id)} className="flex-1 justify-start text-left text-sm font-medium text-foreground hover:text-primary p-0 h-auto">
                  {wf.name}
                </Button>
                <span className="text-xs text-muted-foreground font-mono hidden sm:block">{wf.id}</span>
                <span className="text-xs text-muted-foreground hidden md:block">{wf.updatedAt ? new Date(wf.updatedAt).toLocaleDateString() : ''}</span>
                <Button variant="ghost" className="p-0 h-auto" onClick={() => handleToggle(wf)} title={wf.active ? 'Deactivate' : 'Activate'}>
                  <StatusBadge status={wf.active ? 'active' : 'inactive'} />
                </Button>
                <Button variant="ghost" size="icon" className="h-7 w-7 text-green-400 hover:bg-green-900/30" onClick={() => handleExecute(wf.id)} disabled={executing === wf.id} title="Execute">
                  {executing === wf.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
                </Button>
                <Button variant="ghost" size="icon" className="h-7 w-7 text-red-400 hover:bg-red-900/30" onClick={() => setDeleteTarget(wf)} title="Delete">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>

              {/* Expanded detail */}
              {expandedId === wf.id && (
                <div className="border-t border-border bg-muted p-4 space-y-4">
                  {detailLoading ? (
                    <div className="flex justify-center py-4"><Loader2 className="h-5 w-5 animate-spin text-primary" /></div>
                  ) : detail ? (
                    <>
                      {/* Info cards */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        <Card><CardContent className="p-3"><p className="text-xs text-muted-foreground">Status</p><StatusBadge status={detail.active ? 'active' : 'inactive'} /></CardContent></Card>
                        <Card><CardContent className="p-3"><p className="text-xs text-muted-foreground">Nodes</p><p className="text-sm font-medium text-foreground">{detail.nodes?.length || 0}</p></CardContent></Card>
                        <Card><CardContent className="p-3"><p className="text-xs text-muted-foreground">Created</p><p className="text-sm font-medium text-foreground">{detail.createdAt ? new Date(detail.createdAt).toLocaleString() : '-'}</p></CardContent></Card>
                        <Card><CardContent className="p-3"><p className="text-xs text-muted-foreground">Updated</p><p className="text-sm font-medium text-foreground">{detail.updatedAt ? new Date(detail.updatedAt).toLocaleString() : '-'}</p></CardContent></Card>
                      </div>

                      {/* Tags */}
                      <Card>
                        <CardContent className="p-3">
                          <div className="flex items-center gap-2 mb-2">
                            <Tag className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm font-medium text-muted-foreground">Tags</span>
                            {!editingTags && (
                              <Button variant="link" size="sm" className="ml-auto text-primary p-0 h-auto" onClick={startEditTags}>
                                <Pencil className="h-3 w-3 mr-1" /> Edit
                              </Button>
                            )}
                          </div>
                          {editingTags ? (
                            <div className="space-y-2">
                              <div className="flex flex-wrap gap-2">
                                {allTags.map((t: any) => (
                                  <Button
                                    key={t.id}
                                    variant="outline"
                                    size="sm"
                                    onClick={() => toggleTagId(String(t.id))}
                                    className={`px-2 py-1 text-xs rounded-full h-auto ${
                                      selectedTagIds.includes(String(t.id))
                                        ? 'bg-primary/10 text-primary border-primary/30'
                                        : 'bg-muted text-muted-foreground border-border hover:border-primary/30'
                                    }`}
                                  >
                                    {t.name}
                                  </Button>
                                ))}
                                {allTags.length === 0 && <span className="text-xs text-muted-foreground">No tags available</span>}
                              </div>
                              <div className="flex gap-2">
                                <Button size="sm" onClick={handleSaveTags} disabled={savingTags}>
                                  {savingTags ? 'Saving...' : 'Save Tags'}
                                </Button>
                                <Button variant="outline" size="sm" onClick={() => setEditingTags(false)}>Cancel</Button>
                              </div>
                            </div>
                          ) : (
                            <div className="flex flex-wrap gap-1.5">
                              {detailTags.length > 0 ? detailTags.map((t: any) => (
                                <Badge key={t.id || t.name} variant="secondary" className="bg-primary/10 text-primary">{t.name}</Badge>
                              )) : <span className="text-xs text-muted-foreground">No tags</span>}
                            </div>
                          )}
                        </CardContent>
                      </Card>

                      {/* Actions */}
                      <div className="flex gap-2 flex-wrap">
                        <Button variant="outline" size="sm" className={detail.active ? 'text-amber-400 border-amber-700 hover:bg-amber-900/30' : 'text-green-400 border-green-700 hover:bg-green-900/30'} onClick={() => handleToggle(detail)}>
                          {detail.active ? <PowerOff className="h-3.5 w-3.5 mr-2" /> : <Power className="h-3.5 w-3.5 mr-2" />}
                          {detail.active ? 'Deactivate' : 'Activate'}
                        </Button>
                        <Button size="sm" onClick={() => handleExecute(detail.id)} disabled={executing === detail.id}>
                          {executing === detail.id ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-2" /> : <Play className="h-3.5 w-3.5 mr-2" />}
                          Execute
                        </Button>
                        <Button variant="outline" size="sm" className="text-primary border-primary/30 hover:bg-primary/10" onClick={() => { setEditing(!editing); setEditJson(JSON.stringify(detail, null, 2)); }}>
                          <Pencil className="h-3.5 w-3.5 mr-2" /> {editing ? 'Cancel Edit' : 'Edit JSON'}
                        </Button>
                      </div>

                      {/* Edit mode */}
                      {editing && (
                        <div className="space-y-2">
                          <Textarea
                            value={editJson}
                            onChange={(e) => setEditJson(e.target.value)}
                            rows={20}
                            className="font-mono text-xs"
                          />
                          <Button onClick={handleUpdate} disabled={saving}>
                            {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />} Save Changes
                          </Button>
                        </div>
                      )}

                      {/* JSON viewer (read-only) */}
                      {!editing && <JsonViewer data={detail} title="Workflow Definition" />}
                    </>
                  ) : null}
                </div>
              )}
            </Card>
          ))}
          {workflows.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">No workflows found</div>
          )}

          {/* Load More button */}
          {nextCursor && (
            <div className="flex justify-center pt-4">
              <Button variant="outline" onClick={handleLoadMore} disabled={loadingMore}>
                {loadingMore ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                {loadingMore ? 'Loading...' : 'Load More'}
              </Button>
            </div>
          )}
        </div>
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete Workflow"
        message={`Delete "${deleteTarget?.name}"? This will also delete all execution history.`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
