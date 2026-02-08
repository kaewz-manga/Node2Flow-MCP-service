import { useEffect, useState } from 'react';
import { listVariables, createVariable, updateVariable, deleteVariable } from '../../lib/gateway-api';
import { useConnection, Button, Input, Card, CardContent, Table, TableHeader, TableBody, TableRow, TableHead, TableCell, Alert, AlertDescription } from '@node2flow/dashboard-core';

import ConfirmDialog from './components/ConfirmDialog';
import { Loader2, Plus, Pencil, Trash2, Check, X, RefreshCw, AlertCircle, Variable } from 'lucide-react';






export default function VariableList() {
  const { activeConnection } = useConnection();
  const connectionId = activeConnection?.id;
  const [variables, setVariables] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<any>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editKey, setEditKey] = useState('');
  const [editValue, setEditValue] = useState('');
  const [newKey, setNewKey] = useState('');
  const [newValue, setNewValue] = useState('');
  const [creating, setCreating] = useState(false);

  async function fetch() {
    if (!connectionId) return;
    setLoading(true);
    setError('');
    const res = await listVariables(connectionId);
    if (res.success && res.data) {
      const d = res.data as any;
      setVariables(Array.isArray(d) ? d : d.data || []);
    } else {
      setError(res.error?.message || 'Failed');
    }
    setLoading(false);
  }

  useEffect(() => { if (connectionId) fetch(); }, [connectionId]);

  async function handleCreate() {
    if (!newKey.trim() || !connectionId) return;
    setCreating(true);
    const res = await createVariable(connectionId, { key: newKey.trim(), value: newValue });
    if (res.success) { setNewKey(''); setNewValue(''); fetch(); }
    else alert(res.error?.message || 'Failed');
    setCreating(false);
  }

  async function handleUpdate(id: string) {
    if (!editKey.trim() || !connectionId) return;
    const res = await updateVariable(connectionId, id, { key: editKey.trim(), value: editValue });
    if (res.success) { setEditingId(null); fetch(); }
    else alert(res.error?.message || 'Failed');
  }

  async function handleDelete() {
    if (!deleteTarget || !connectionId) return;
    const res = await deleteVariable(connectionId, deleteTarget.id);
    if (res.success) { setDeleteTarget(null); fetch(); }
    else alert(res.error?.message || 'Failed');
  }

  if (!activeConnection) return <div className="text-center py-12 text-muted-foreground">No connection selected. Please select a connection from the sidebar.</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Variables</h1>
          <p className="text-muted-foreground mt-1">{activeConnection.name} - {variables.length} variables</p>
        </div>
        <Button variant="outline" size="icon" onClick={fetch} title="Refresh">
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>

      {/* Create variable */}
      <div className="flex gap-2">
        <Input
          value={newKey}
          onChange={(e) => setNewKey(e.target.value)}
          placeholder="Key"
          className="w-48"
        />
        <Input
          value={newValue}
          onChange={(e) => setNewValue(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') handleCreate(); }}
          placeholder="Value"
          className="flex-1"
        />
        <Button onClick={handleCreate} disabled={creating || !newKey.trim()}>
          {creating ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Plus className="h-4 w-4 mr-2" />} Add
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
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Key</TableHead>
                  <TableHead>Value</TableHead>
                  <TableHead>ID</TableHead>
                  <TableHead className="w-24">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {variables.map((v) => (
                  <TableRow key={v.id}>
                    {editingId === v.id ? (
                      <>
                        <TableCell>
                          <Input value={editKey} onChange={(e) => setEditKey(e.target.value)} className="h-8 text-sm" />
                        </TableCell>
                        <TableCell>
                          <Input value={editValue} onChange={(e) => setEditValue(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') handleUpdate(v.id); if (e.key === 'Escape') setEditingId(null); }} className="h-8 text-sm" autoFocus />
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground font-mono">{v.id}</TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Button variant="ghost" size="icon" className="h-7 w-7 text-emerald-400 hover:bg-emerald-900/30" onClick={() => handleUpdate(v.id)}><Check className="h-4 w-4" /></Button>
                            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setEditingId(null)}><X className="h-4 w-4" /></Button>
                          </div>
                        </TableCell>
                      </>
                    ) : (
                      <>
                        <TableCell className="font-mono font-medium">{v.key}</TableCell>
                        <TableCell className="text-muted-foreground font-mono">{v.value}</TableCell>
                        <TableCell className="text-xs text-muted-foreground font-mono">{v.id}</TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Button variant="ghost" size="icon" className="h-7 w-7 hover:text-primary hover:bg-primary/10" onClick={() => { setEditingId(v.id); setEditKey(v.key); setEditValue(v.value); }} title="Edit">
                              <Pencil className="h-3.5 w-3.5" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-7 w-7 hover:text-red-400 hover:bg-red-900/30" onClick={() => setDeleteTarget(v)} title="Delete">
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </TableCell>
                      </>
                    )}
                  </TableRow>
                ))}
                {variables.length === 0 && (
                  <TableRow><TableCell colSpan={4} className="text-center py-8 text-muted-foreground">No variables found</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete Variable"
        message={`Delete variable "${deleteTarget?.key}"? This cannot be undone.`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
