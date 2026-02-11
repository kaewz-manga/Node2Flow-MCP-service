import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import {
  listExecutions, getExecution, deleteExecution, retryExecution,
} from '../../lib/gateway-api';
import { usePluginConnection, Button, Input, Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter, Alert, AlertDescription, Separator, Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@node2flow/dashboard-core';

import StatusBadge from './components/StatusBadge';
import JsonViewer from './components/JsonViewer';
import ConfirmDialog from './components/ConfirmDialog';
import {
  Loader2, RefreshCw, Trash2, RotateCcw, AlertCircle, Filter,
  ChevronDown, ChevronRight, Activity, CheckCircle2, XCircle, Clock,
} from 'lucide-react';

const PAGE_SIZE = 20;

export default function ExecutionList() {
  const activeConnection = usePluginConnection('n8n');
  const connectionId = activeConnection?.id;
  const [executions, setExecutions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<any>(null);
  const [retrying, setRetrying] = useState<string | null>(null);
  const [filterWorkflow, setFilterWorkflow] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [loadingMore, setLoadingMore] = useState(false);

  // Expanded detail
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [detail, setDetail] = useState<any>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  async function fetchList() {
    if (!connectionId) return;
    setLoading(true);
    setError('');
    const res = await listExecutions(connectionId, filterWorkflow || undefined, PAGE_SIZE);
    if (res.success && res.data) {
      const data = res.data as any;
      let list = Array.isArray(data) ? data : data.data || data.results || [];
      setNextCursor(data.nextCursor || null);
      if (filterStatus) list = list.filter((e: any) => e.status === filterStatus);
      setExecutions(list);
    } else {
      setError(res.error?.message || 'Failed to load');
    }
    setLoading(false);
  }

  useEffect(() => { if (connectionId) fetchList(); }, [connectionId, filterWorkflow, filterStatus]);

  async function handleLoadMore() {
    if (!connectionId || !nextCursor) return;
    setLoadingMore(true);
    const res = await listExecutions(connectionId, filterWorkflow || undefined, PAGE_SIZE, nextCursor);
    if (res.success && res.data) {
      const data = res.data as any;
      let newItems = Array.isArray(data) ? data : data.data || data.results || [];
      setNextCursor(data.nextCursor || null);
      if (filterStatus) newItems = newItems.filter((e: any) => e.status === filterStatus);
      setExecutions(prev => [...prev, ...newItems]);
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
    const res = await getExecution(connectionId, id);
    if (res.success && res.data) setDetail(res.data);
    else setDetail(null);
    setDetailLoading(false);
  }

  async function handleRetry(id: string) {
    if (!connectionId) return;
    setRetrying(id);
    const res = await retryExecution(connectionId, id);
    setRetrying(null);
    if (res.success) { toast.success('Retry queued'); fetchList(); }
    else toast.error(res.error?.message || 'Retry failed');
  }

  async function handleDelete() {
    if (!deleteTarget || !connectionId) return;
    const res = await deleteExecution(connectionId, deleteTarget.id);
    if (res.success) {
      setDeleteTarget(null);
      if (expandedId === deleteTarget.id) setExpandedId(null);
      fetchList();
    } else toast.error(res.error?.message || 'Failed');
  }

  if (!activeConnection) return <div className="text-center py-12 text-muted-foreground">No connection selected. Please select a connection from the sidebar.</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Executions</h1>
          <p className="text-muted-foreground mt-1">{activeConnection.name} - {executions.length} executions</p>
        </div>
        <Button variant="outline" size="icon" onClick={fetchList} title="Refresh">
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>

      {/* Stat Cards */}
      {!loading && (() => {
        const successCount = executions.filter(e => e.status === 'success' || (!e.status && e.finished)).length;
        const errorCount = executions.filter(e => e.status === 'error' || e.status === 'crashed').length;
        const runningCount = executions.filter(e => e.status === 'running' || e.status === 'waiting').length;
        return (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="bg-gradient-to-t from-primary/5 to-card shadow-sm">
              <CardHeader className="pb-2">
                <CardDescription>Total Executions</CardDescription>
                <CardTitle className="text-2xl font-semibold tabular-nums">{executions.length}</CardTitle>
              </CardHeader>
              <CardFooter className="text-sm text-muted-foreground">
                <Activity className="h-3.5 w-3.5 mr-1.5 text-primary" />
                All runs
              </CardFooter>
            </Card>
            <Card className="bg-gradient-to-t from-emerald-500/5 to-card shadow-sm">
              <CardHeader className="pb-2">
                <CardDescription>Success</CardDescription>
                <CardTitle className="text-2xl font-semibold tabular-nums text-emerald-500">{successCount}</CardTitle>
              </CardHeader>
              <CardFooter className="text-sm text-muted-foreground">
                <CheckCircle2 className="h-3.5 w-3.5 mr-1.5 text-emerald-500" />
                {executions.length > 0 ? `${Math.round((successCount / executions.length) * 100)}%` : '0%'} success rate
              </CardFooter>
            </Card>
            <Card className="bg-gradient-to-t from-red-500/5 to-card shadow-sm">
              <CardHeader className="pb-2">
                <CardDescription>Errors</CardDescription>
                <CardTitle className="text-2xl font-semibold tabular-nums text-red-500">{errorCount}</CardTitle>
              </CardHeader>
              <CardFooter className="text-sm text-muted-foreground">
                <XCircle className="h-3.5 w-3.5 mr-1.5 text-red-500" />
                Failed runs
              </CardFooter>
            </Card>
            <Card className="bg-gradient-to-t from-amber-500/5 to-card shadow-sm">
              <CardHeader className="pb-2">
                <CardDescription>Running</CardDescription>
                <CardTitle className="text-2xl font-semibold tabular-nums text-amber-500">{runningCount}</CardTitle>
              </CardHeader>
              <CardFooter className="text-sm text-muted-foreground">
                <Clock className="h-3.5 w-3.5 mr-1.5 text-amber-500" />
                In progress
              </CardFooter>
            </Card>
          </div>
        );
      })()}

      <Separator />

      {/* Filters */}
      <div className="flex gap-3 items-center flex-wrap">
        <Filter className="h-4 w-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Filter by Workflow ID..."
          value={filterWorkflow}
          onChange={(e) => setFilterWorkflow(e.target.value)}
          className="w-48"
        />
        <Select value={filterStatus || 'all'} onValueChange={(value) => setFilterStatus(value === 'all' ? '' : value)}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="All statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="success">Success</SelectItem>
            <SelectItem value="error">Error</SelectItem>
            <SelectItem value="waiting">Waiting</SelectItem>
            <SelectItem value="running">Running</SelectItem>
          </SelectContent>
        </Select>
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
        <div className="space-y-2">
          {executions.map((ex) => {
            const status = ex.status || (ex.finished ? 'success' : 'running');
            return (
              <Card key={ex.id} className="overflow-hidden hover:shadow-md transition-all">
                {/* Row */}
                <div className="flex items-center gap-3 px-4 py-3 hover:bg-muted">
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => loadDetail(ex.id)}>
                    {expandedId === ex.id ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                  </Button>
                  <Button variant="link" onClick={() => loadDetail(ex.id)} className="text-sm font-mono text-primary hover:underline p-0 h-auto">
                    #{ex.id}
                  </Button>
                  <span className="flex-1 text-sm text-muted-foreground truncate">{ex.workflowData?.name || ex.workflowId || '-'}</span>
                  <span className="text-xs text-muted-foreground hidden md:block">{ex.startedAt ? new Date(ex.startedAt).toLocaleString() : ''}</span>
                  <StatusBadge status={status} />
                  {(status === 'error' || status === 'crashed') && (
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-primary hover:bg-primary/10" onClick={() => handleRetry(ex.id)} disabled={retrying === ex.id} title="Retry">
                      {retrying === ex.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <RotateCcw className="h-4 w-4" />}
                    </Button>
                  )}
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-red-400 hover:bg-red-900/30" onClick={() => setDeleteTarget(ex)} title="Delete">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>

                {/* Expanded detail */}
                {expandedId === ex.id && (
                  <div className="border-t border-border bg-muted p-4 space-y-4">
                    {detailLoading ? (
                      <div className="flex justify-center py-4"><Loader2 className="h-5 w-5 animate-spin text-primary" /></div>
                    ) : detail ? (
                      <>
                        {/* Info cards */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                          <Card><CardContent className="p-3"><p className="text-xs text-muted-foreground">Status</p><StatusBadge status={detail.status || (detail.finished ? 'success' : 'running')} /></CardContent></Card>
                          <Card><CardContent className="p-3"><p className="text-xs text-muted-foreground">Started</p><p className="text-sm font-medium text-foreground">{detail.startedAt ? new Date(detail.startedAt).toLocaleString() : '-'}</p></CardContent></Card>
                          <Card><CardContent className="p-3"><p className="text-xs text-muted-foreground">Finished</p><p className="text-sm font-medium text-foreground">{detail.stoppedAt ? new Date(detail.stoppedAt).toLocaleString() : '-'}</p></CardContent></Card>
                          <Card><CardContent className="p-3"><p className="text-xs text-muted-foreground">Duration</p><p className="text-sm font-medium text-foreground">{detail.startedAt && detail.stoppedAt ? `${((new Date(detail.stoppedAt).getTime() - new Date(detail.startedAt).getTime()) / 1000).toFixed(1)}s` : '-'}</p></CardContent></Card>
                        </div>

                        {/* Error */}
                        {(detail.status === 'error' || detail.status === 'crashed') && detail.data?.resultData?.error && (
                          <div className="bg-red-900/30 border border-red-700 rounded-lg p-3">
                            <p className="text-xs font-medium text-red-300 mb-1">Error</p>
                            <p className="text-xs text-red-300 font-mono">{detail.data.resultData.error.message}</p>
                            {detail.data.resultData.error.node && (
                              <p className="text-xs text-red-400 mt-1">Node: {detail.data.resultData.error.node}</p>
                            )}
                          </div>
                        )}

                        {/* Actions */}
                        <div className="flex gap-2">
                          {(detail.status === 'error' || detail.status === 'crashed') && (
                            <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white" onClick={() => handleRetry(detail.id)} disabled={retrying === detail.id}>
                              {retrying === detail.id ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-2" /> : <RotateCcw className="h-3.5 w-3.5 mr-2" />}
                              Retry
                            </Button>
                          )}
                          <Button variant="outline" size="sm" className="text-red-400 border-red-700 hover:bg-red-900/30" onClick={() => setDeleteTarget(detail)}>
                            <Trash2 className="h-3.5 w-3.5 mr-2" /> Delete
                          </Button>
                        </div>

                        {/* Full data */}
                        <JsonViewer data={detail} title="Execution Data" />
                      </>
                    ) : <div className="text-center text-muted-foreground text-sm">Failed to load detail</div>}
                  </div>
                )}
              </Card>
            );
          })}
          {executions.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">No executions found</div>
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
        title="Delete Execution"
        message={`Delete execution #${deleteTarget?.id}? This cannot be undone.`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
