import { useState } from 'react';
import { toast } from 'sonner';
import { createCredential, updateCredential, deleteCredential, getCredentialSchema } from '../../lib/gateway-api';
import { useConnection, Button, Input, Label, Card, CardContent, Textarea } from '@node2flow/dashboard-core';

import JsonViewer from './components/JsonViewer';
import ConfirmDialog from './components/ConfirmDialog';
import { Loader2, Plus, Trash2, Search, X, Pencil, Save } from 'lucide-react';






export default function CredentialList() {
  const { activeConnection } = useConnection();
  const connectionId = activeConnection?.id;
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  // Create credential
  const [showCreate, setShowCreate] = useState(false);
  const [createName, setCreateName] = useState('');
  const [createType, setCreateType] = useState('');
  const [createData, setCreateData] = useState('{}');
  const [creating, setCreating] = useState(false);

  // Update credential
  const [showUpdate, setShowUpdate] = useState(false);
  const [updateId, setUpdateId] = useState('');
  const [updateName, setUpdateName] = useState('');
  const [updateType, setUpdateType] = useState('');
  const [updateData, setUpdateData] = useState('{}');
  const [updating, setUpdating] = useState(false);

  // Schema lookup
  const [schemaType, setSchemaType] = useState('');
  const [schema, setSchema] = useState<any>(null);
  const [loadingSchema, setLoadingSchema] = useState(false);

  async function handleCreate() {
    if (!createName || !createType) return toast.error('Name and type are required');
    if (!connectionId) return;
    setCreating(true);
    try {
      const data = JSON.parse(createData);
      const res = await createCredential(connectionId, { name: createName, type: createType, data });
      if (res.success) {
        toast.success('Credential created');
        setShowCreate(false);
        setCreateName(''); setCreateType(''); setCreateData('{}');
      } else toast.error(res.error?.message || 'Failed');
    } catch { toast.error('Invalid JSON in data field'); }
    setCreating(false);
  }

  async function handleUpdate() {
    if (!updateId) return toast.error('Credential ID is required');
    if (!connectionId) return;
    setUpdating(true);
    try {
      const data: any = {};
      if (updateName) data.name = updateName;
      if (updateType) data.type = updateType;
      if (updateData && updateData !== '{}') data.data = JSON.parse(updateData);
      const res = await updateCredential(connectionId, updateId, data);
      if (res.success) {
        toast.success('Credential updated');
        setShowUpdate(false);
        setUpdateId(''); setUpdateName(''); setUpdateType(''); setUpdateData('{}');
      } else toast.error(res.error?.message || 'Failed');
    } catch { toast.error('Invalid JSON in data field'); }
    setUpdating(false);
  }

  async function handleSchemaLookup() {
    if (!schemaType || !connectionId) return;
    setLoadingSchema(true);
    const res = await getCredentialSchema(connectionId, schemaType);
    if (res.success && res.data) setSchema(res.data);
    else toast.error(res.error?.message || 'Schema not found');
    setLoadingSchema(false);
  }

  async function handleDelete() {
    if (!deleteTarget || !connectionId) return;
    const res = await deleteCredential(connectionId, deleteTarget);
    if (res.success) { setDeleteTarget(null); toast.success('Credential deleted'); }
    else toast.error(res.error?.message || 'Failed');
  }

  if (!activeConnection) return <div className="text-center py-12 text-muted-foreground">No connection selected. Please select a connection from the sidebar.</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Credentials</h1>
          <p className="text-muted-foreground mt-1">Create, update, delete credentials on {activeConnection.name}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => { setShowUpdate(!showUpdate); setShowCreate(false); }}>
            <Pencil className="h-4 w-4 mr-2" /> Update
          </Button>
          <Button onClick={() => { setShowCreate(!showCreate); setShowUpdate(false); }}>
            <Plus className="h-4 w-4 mr-2" /> Create
          </Button>
        </div>
      </div>

      {/* Create form */}
      {showCreate && (
        <Card>
          <CardContent className="p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-medium text-foreground">Create Credential</h3>
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setShowCreate(false)}><X className="h-4 w-4" /></Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">Name *</Label>
                <Input value={createName} onChange={(e) => setCreateName(e.target.value)} placeholder="My API Key" className="mt-1" />
              </div>
              <div>
                <Label className="text-xs">Type *</Label>
                <Input value={createType} onChange={(e) => setCreateType(e.target.value)} placeholder="httpBasicAuth" className="mt-1" />
              </div>
            </div>
            <div>
              <Label className="text-xs">Data (JSON)</Label>
              <Textarea value={createData} onChange={(e) => setCreateData(e.target.value)} rows={4} className="mt-1 font-mono text-sm" placeholder='{"user": "...", "password": "..."}' />
            </div>
            <Button variant="secondary" className="bg-emerald-600 hover:bg-emerald-700 text-white" onClick={handleCreate} disabled={creating}>
              {creating ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Plus className="h-4 w-4 mr-2" />} Create
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Update form */}
      {showUpdate && (
        <Card className="border-primary/30">
          <CardContent className="p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-medium text-foreground">Update Credential</h3>
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setShowUpdate(false)}><X className="h-4 w-4" /></Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <Label className="text-xs">Credential ID *</Label>
                <Input value={updateId} onChange={(e) => setUpdateId(e.target.value)} className="mt-1 font-mono" placeholder="123" />
              </div>
              <div>
                <Label className="text-xs">New Name (optional)</Label>
                <Input value={updateName} onChange={(e) => setUpdateName(e.target.value)} className="mt-1" placeholder="Updated Name" />
              </div>
              <div>
                <Label className="text-xs">New Type (optional)</Label>
                <Input value={updateType} onChange={(e) => setUpdateType(e.target.value)} className="mt-1" placeholder="httpBasicAuth" />
              </div>
            </div>
            <div>
              <Label className="text-xs">New Data (JSON, optional)</Label>
              <Textarea value={updateData} onChange={(e) => setUpdateData(e.target.value)} rows={4} className="mt-1 font-mono text-sm" placeholder='{"user": "new_user", "password": "new_pass"}' />
            </div>
            <Button onClick={handleUpdate} disabled={updating}>
              {updating ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />} Update
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Schema lookup */}
      <Card>
        <CardContent className="p-4 space-y-3">
          <h3 className="font-medium text-foreground">Credential Schema Lookup</h3>
          <div className="flex gap-2">
            <Input
              value={schemaType}
              onChange={(e) => setSchemaType(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') handleSchemaLookup(); }}
              placeholder="e.g. httpBasicAuth, slackApi, openAiApi"
              className="flex-1"
            />
            <Button variant="secondary" onClick={handleSchemaLookup} disabled={loadingSchema}>
              {loadingSchema ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Search className="h-4 w-4 mr-2" />} Lookup
            </Button>
          </div>
          {schema && <JsonViewer data={schema} title={`Schema: ${schemaType}`} />}
        </CardContent>
      </Card>

      {/* Delete by ID */}
      <Card>
        <CardContent className="p-4 space-y-3">
          <h3 className="font-medium text-foreground">Delete Credential by ID</h3>
          <div className="flex gap-2">
            <Input
              id="delete-cred-id"
              placeholder="Credential ID"
              className="flex-1 font-mono"
              onKeyDown={(e) => { if (e.key === 'Enter') setDeleteTarget((e.target as HTMLInputElement).value); }}
            />
            <Button variant="outline" className="text-red-400 border-red-700 hover:bg-red-900/30" onClick={() => {
              const input = document.getElementById('delete-cred-id') as HTMLInputElement;
              if (input?.value) setDeleteTarget(input.value);
            }}>
              <Trash2 className="h-4 w-4 mr-2" /> Delete
            </Button>
          </div>
        </CardContent>
      </Card>

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete Credential"
        message={`Delete credential "${deleteTarget}"? This cannot be undone.`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
