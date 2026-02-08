import { useEffect, useState } from 'react';
import {
  listExecutions, getExecution, deleteExecution, retryExecution,
} from '../../lib/gateway-api';
import { useConnection, Button, Input, Card, CardContent, Alert, AlertDescription } from '@node2flow/dashboard-core';

import StatusBadge from './components/StatusBadge';
import JsonViewer from './components/JsonViewer';
import ConfirmDialog from './components/ConfirmDialog';
import {
  Loader2, RefreshCw, Trash2, RotateCcw, AlertCircle, Filter,
  ChevronDown, ChevronRight,
} from 'lucide-react';





export default function ExecutionList() {
  const { activeConnection } = useConnection();
  const connectionId = activeConnection?.id;
  const [executions, setExecutions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<any>(null);
  const [retrying, setRetrying] = useState<string | null>(null);
  const [filterWorkflow, setFilterWorkflow] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  // Expanded detail
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [detail, setDetail] = useState<any>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  async function fetchList() {
    if (!connectionId) return;
    setLoading(true);
    setError('');
    const res = await listExecutions(connectionId, filterWorkflow || undefined);
    if (res.success && res.data) {
      const data = res.data as any;
      let list = Array.isArray(data) ? data : data.data || data.results || [];
      if (filterStatus) list = list.filter((e: any) => e.status === filterStatus);
      setExecutions(list);
    } else {
      setError(res.error?.message || 'Failed to load');
    }
    setLoading(false);
  }

  useEffect(() => { if (connectionId) fetchList(); }, [connectionId, filterWorkflow, filterStatus]);

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
    if (res.success) { alert('Retry queued'); fetchList(); }
    else alert(res.error?.message || 'Retry failed');
  }

  async function handleDelete() {
    if (!deleteTarget || !connectionId) return;
    const res = await deleteExecution(connectionId, deleteTarget.id);
    if (res.success) {
      setDeleteTarget(null);
      if (expandedId === deleteTarget.id) setExpandedId(null);
      fetchList();
    } else alert(res.error?.message || 'Failed');
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
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-3 py-1.5 text-sm border border-border rounded-lg bg-card text-foreground"
        >
          <option value="">All statuses</option>
          <option value="success">Success</option>
          <option value="error">Error</option>
          <option value="waiting">Waiting</option>
          <option value="running">Running</option>
        </select>
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
              <Card key={ex.id} className="overflow-hidden">
                {/* Row */}
                <div className="flex items-center gap-3 px-4 py-3 hover:bg-muted">
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => loadDetail(ex.id)}>
                    {expandedId === ex.id ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                  </Button>
                  <button onClick={() => loadDetail(ex.id)} className="text-sm font-mono text-primary hover:underline">
                    #{ex.id}
                  </button>
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
                            <Button size="sm" onClick={() => handleRetry(detail.id)} disabled={retrying === detail.id}>
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
