import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { createConnection, updateConnection, deleteConnection } from '../../lib/gateway-api';
import { getApiKeys, createApiKey, deleteApiKey } from '../../lib/platform-api';
import type { ApiKeyInfo } from '../../lib/platform-api';
import {
  getConnections, useConnection, useSudoContext, type Connection,
  Field, FieldLabel, FieldDescription,
  InputGroup, InputGroupInput, InputGroupAddon,
  Button, Card, CardContent,
  Alert, AlertTitle, AlertDescription, Badge,
  Table, TableHeader, TableBody, TableHead, TableRow, TableCell,
  Dialog, DialogContent, DialogHeader, DialogTitle,
  AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle,
  AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction,
  Item, ItemMedia, ItemContent, ItemTitle, ItemDescription, ItemActions,
  DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator,
  Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription, EmptyContent,
  useIsMobile, Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter, SheetClose,
} from '@node2flow/dashboard-core';

import {
  Plus, Trash2, Key, Copy, Check, Loader2, AlertCircle, RefreshCw,
  Database, Lock, Tag, MoreHorizontal, Pencil, Info, Globe, Brain,
} from 'lucide-react';

const PRODUCT_TYPE = 'qdrant';

export default function Connections() {
  const { withSudo, totpEnabled, statusLoaded } = useSudoContext();
  const { activeConnection, setActiveConnectionId } = useConnection();
  const [connections, setConnections] = useState<Connection[]>([]);
  const [apiKeys, setApiKeys] = useState<ApiKeyInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [showAddModal, setShowAddModal] = useState(false);
  const [showApiKeyModal, setShowApiKeyModal] = useState(false);
  const [newApiKey, setNewApiKey] = useState('');

  const [formName, setFormName] = useState('');
  const [formQdrantUrl, setFormQdrantUrl] = useState('');
  const [formApiKey, setFormApiKey] = useState('');
  const [formCollection, setFormCollection] = useState('');
  const [formEmbeddingModel, setFormEmbeddingModel] = useState('');
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState('');

  const [copied, setCopied] = useState(false);
  const [copiedMcp, setCopiedMcp] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [deleteKeyTarget, setDeleteKeyTarget] = useState<string | null>(null);
  const [editTarget, setEditTarget] = useState<{ id: string; name: string } | null>(null);
  const [editName, setEditName] = useState('');
  const [generateKeyTarget, setGenerateKeyTarget] = useState<string | null>(null);
  const isMobile = useIsMobile();

  const fetchConnections = async () => {
    setLoading(true);
    const [connRes, keysRes] = await Promise.all([
      getConnections(PRODUCT_TYPE),
      getApiKeys(),
    ]);
    if (connRes.success && connRes.data) {
      setConnections(connRes.data.connections);
    } else {
      setError(connRes.error?.message || 'Failed to load connections');
    }
    if (keysRes.success && keysRes.data) {
      setApiKeys(keysRes.data.api_keys);
    }
    setLoading(false);
  };

  useEffect(() => { fetchConnections(); }, []);

  const handleAddConnection = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setFormLoading(true);

    if (!formQdrantUrl.trim()) {
      setFormError('Qdrant URL is required');
      setFormLoading(false);
      return;
    }
    if (!formCollection.trim()) {
      setFormError('Collection Name is required');
      setFormLoading(false);
      return;
    }

    const config: Record<string, unknown> = {
      qdrant_url: formQdrantUrl.trim(),
      collection_name: formCollection.trim(),
    };
    if (formApiKey.trim()) {
      config.api_key = formApiKey.trim();
    }
    if (formEmbeddingModel.trim()) {
      config.embedding_model = formEmbeddingModel.trim();
    }

    const res = await createConnection(PRODUCT_TYPE, formName, config);

    if (res.success && res.data) {
      const keyRes = await createApiKey((res.data as any).id || (res.data as any).connection?.id);
      if (keyRes.success && keyRes.data) {
        setNewApiKey(keyRes.data.api_key);
        setShowApiKeyModal(true);
      }
      setShowAddModal(false);
      setFormName(''); setFormQdrantUrl(''); setFormApiKey(''); setFormCollection(''); setFormEmbeddingModel('');
      fetchConnections();
    } else {
      setFormError(res.error?.message || 'Failed to add connection');
    }
    setFormLoading(false);
  };

  const handleEditName = async () => {
    if (!editTarget) return;
    const res = await updateConnection(editTarget.id, { name: editName });
    if (res.success) {
      toast.success('Connection renamed');
      setEditTarget(null);
      fetchConnections();
    } else {
      toast.error(res.error?.message || 'Failed to rename');
    }
  };

  const handleDeleteConnection = async () => {
    if (!deleteTarget) return;
    withSudo(async () => {
      const res = await deleteConnection(deleteTarget);
      if (res.success) {
        toast.success('Connection deleted');
        setDeleteTarget(null);
        fetchConnections();
      } else {
        toast.error(res.error?.message || 'Failed to delete');
      }
    });
  };

  const handleGenerateKey = async () => {
    if (!generateKeyTarget) return;
    const res = await createApiKey(generateKeyTarget);
    if (res.success && res.data) {
      setNewApiKey(res.data.api_key);
      setShowApiKeyModal(true);
      setGenerateKeyTarget(null);
      fetchConnections();
    } else {
      toast.error('Failed to generate API key');
    }
  };

  const handleDeleteKey = async () => {
    if (!deleteKeyTarget) return;
    withSudo(async () => {
      const res = await deleteApiKey(deleteKeyTarget);
      if (res.success) {
        toast.success('API key deleted');
        setDeleteKeyTarget(null);
        fetchConnections();
      } else {
        toast.error('Failed to delete API key');
      }
    });
  };

  const copyText = (text: string, setter: (v: boolean) => void) => {
    navigator.clipboard.writeText(text);
    setter(true);
    setTimeout(() => setter(false), 2000);
  };

  const show2faAlert = statusLoaded && !totpEnabled;
  const AddModal = isMobile ? Sheet : Dialog;
  const AddModalContent = isMobile ? SheetContent : DialogContent;
  const AddModalHeader = isMobile ? SheetHeader : DialogHeader;
  const AddModalTitle = isMobile ? SheetTitle : DialogTitle;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-muted-foreground">
        <Loader2 className="h-5 w-5 animate-spin mr-2" /> Loading connections...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {show2faAlert && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Enable 2FA for better security</AlertTitle>
          <AlertDescription>
            Two-factor authentication protects your Qdrant connections. Enable it in Settings.
          </AlertDescription>
        </Alert>
      )}

      <Item>
        <ItemMedia><img src="/logos/qdrant.svg?v=3" alt="Qdrant" className="h-10 w-10" /></ItemMedia>
        <ItemContent>
          <ItemTitle>MCP Endpoint</ItemTitle>
          <ItemDescription className="font-mono text-xs">https://mcp.node2flow.net/mcp</ItemDescription>
        </ItemContent>
        <ItemActions>
          <Button variant="ghost" size="icon" onClick={() => copyText('https://mcp.node2flow.net/mcp', setCopiedMcp)}>
            {copiedMcp ? <Check className="h-4 w-4 text-green-400" /> : <Copy className="h-4 w-4" />}
          </Button>
        </ItemActions>
      </Item>

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Qdrant Connections</h2>
          <p className="text-sm text-muted-foreground">Manage your Qdrant vector database connections</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="icon" onClick={fetchConnections}>
            <RefreshCw className="h-4 w-4" />
          </Button>
          <Button onClick={() => setShowAddModal(true)} className="bg-green-600 hover:bg-green-700">
            <Plus className="h-4 w-4 mr-2" /> Add Connection
          </Button>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {connections.length === 0 && !error && (
        <Empty>
          <EmptyHeader>
            <EmptyMedia><Database className="h-10 w-10 text-muted-foreground" /></EmptyMedia>
            <EmptyTitle>No Qdrant connections</EmptyTitle>
            <EmptyDescription>Add your Qdrant URL and collection name to get started.</EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Button onClick={() => setShowAddModal(true)} className="bg-green-600 hover:bg-green-700">
              <Plus className="h-4 w-4 mr-2" /> Add Connection
            </Button>
          </EmptyContent>
        </Empty>
      )}

      {connections.length > 0 && (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-center">Name</TableHead>
              <TableHead className="text-center">Connection ID</TableHead>
              <TableHead className="text-center">API Key</TableHead>
              <TableHead className="text-center">Status</TableHead>
              <TableHead className="text-center w-[60px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {connections.map((c) => {
              const connKey = apiKeys.find(k => k.connection_id === c.id);
              return (
                <TableRow key={c.id} className={activeConnection?.id === c.id ? 'bg-muted/50' : ''}>
                  <TableCell className="text-center font-medium">{c.name}</TableCell>
                  <TableCell className="text-center font-mono text-xs">{c.id.slice(0, 12)}...</TableCell>
                  <TableCell className="text-center">
                    {connKey ? (
                      <Badge variant="outline" className="font-mono text-xs">{connKey.prefix}...</Badge>
                    ) : (
                      <Button variant="ghost" size="sm" onClick={() => setGenerateKeyTarget(c.id)}>
                        <Key className="h-3 w-3 mr-1" /> Generate
                      </Button>
                    )}
                  </TableCell>
                  <TableCell className="text-center">
                    <span className={`inline-block w-2 h-2 rounded-full ${c.status === 'active' ? 'bg-green-400' : 'bg-gray-400'}`} />
                  </TableCell>
                  <TableCell className="text-center">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => setActiveConnectionId(c.id)}>
                          <Check className="h-4 w-4 mr-2" /> Set Active
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => { setEditTarget({ id: c.id, name: c.name }); setEditName(c.name); }}>
                          <Pencil className="h-4 w-4 mr-2" /> Rename
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        {connKey && (
                          <DropdownMenuItem onClick={() => setDeleteKeyTarget(connKey.id)} className="text-red-400">
                            <Trash2 className="h-4 w-4 mr-2" /> Delete API Key
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem onClick={() => setDeleteTarget(c.id)} className="text-red-400">
                          <Trash2 className="h-4 w-4 mr-2" /> Delete Connection
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      )}

      <AddModal open={showAddModal} onOpenChange={setShowAddModal}>
        <AddModalContent>
          <AddModalHeader>
            <AddModalTitle>Add Qdrant Connection</AddModalTitle>
          </AddModalHeader>
          <form onSubmit={handleAddConnection} className="space-y-4 py-4">
            {formError && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{formError}</AlertDescription>
              </Alert>
            )}
            <Field>
              <FieldLabel>Connection Name</FieldLabel>
              <InputGroup>
                <InputGroupAddon><Tag className="h-4 w-4" /></InputGroupAddon>
                <InputGroupInput placeholder="My Qdrant" value={formName} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormName(e.target.value)} required />
              </InputGroup>
            </Field>
            <Field>
              <FieldLabel>Qdrant URL</FieldLabel>
              <FieldDescription>Your Qdrant server URL (local or Qdrant Cloud)</FieldDescription>
              <InputGroup>
                <InputGroupAddon><Globe className="h-4 w-4" /></InputGroupAddon>
                <InputGroupInput placeholder="http://localhost:6333 or https://xxx.cloud.qdrant.io:6333" value={formQdrantUrl} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormQdrantUrl(e.target.value)} required />
              </InputGroup>
            </Field>
            <Field>
              <FieldLabel>API Key <span className="text-muted-foreground font-normal">(Optional)</span></FieldLabel>
              <FieldDescription>Required for Qdrant Cloud or API key-protected instances</FieldDescription>
              <InputGroup>
                <InputGroupAddon><Lock className="h-4 w-4" /></InputGroupAddon>
                <InputGroupInput type="password" placeholder="your-qdrant-api-key" value={formApiKey} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormApiKey(e.target.value)} />
              </InputGroup>
            </Field>
            <Field>
              <FieldLabel>Collection Name</FieldLabel>
              <FieldDescription>The vector collection to store/search in (auto-created if missing)</FieldDescription>
              <InputGroup>
                <InputGroupAddon><Database className="h-4 w-4" /></InputGroupAddon>
                <InputGroupInput placeholder="my-collection" value={formCollection} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormCollection(e.target.value)} required />
              </InputGroup>
            </Field>
            <Field>
              <FieldLabel>Embedding Model <span className="text-muted-foreground font-normal">(Optional)</span></FieldLabel>
              <FieldDescription>Defaults to sentence-transformers/all-MiniLM-L6-v2</FieldDescription>
              <InputGroup>
                <InputGroupAddon><Brain className="h-4 w-4" /></InputGroupAddon>
                <InputGroupInput placeholder="sentence-transformers/all-MiniLM-L6-v2" value={formEmbeddingModel} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormEmbeddingModel(e.target.value)} />
              </InputGroup>
            </Field>
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setShowAddModal(false)}>Cancel</Button>
              <Button type="submit" disabled={formLoading} className="bg-green-600 hover:bg-green-700">
                {formLoading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Creating...</> : <><Plus className="h-4 w-4 mr-2" /> Create</>}
              </Button>
            </div>
          </form>
        </AddModalContent>
      </AddModal>

      <Dialog open={showApiKeyModal} onOpenChange={setShowApiKeyModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><Check className="h-5 w-5 text-green-400" /> API Key Generated</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <p className="text-sm text-muted-foreground">Copy this API key now. It won't be shown again.</p>
            <div className="flex items-center gap-2">
              <code className="flex-1 bg-muted px-3 py-2 rounded text-sm font-mono break-all">{newApiKey}</code>
              <Button variant="ghost" size="icon" onClick={() => copyText(newApiKey, setCopied)}>
                {copied ? <Check className="h-4 w-4 text-green-400" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={!!editTarget} onOpenChange={() => setEditTarget(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Rename Connection</DialogTitle></DialogHeader>
          <div className="space-y-4 py-4">
            <InputGroup>
              <InputGroupInput placeholder="Connection name" value={editName} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditName(e.target.value)} />
            </InputGroup>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setEditTarget(null)}>Cancel</Button>
              <Button onClick={handleEditName} className="bg-green-600 hover:bg-green-700">Save</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Connection</AlertDialogTitle>
            <AlertDialogDescription>This will permanently delete this Qdrant connection and its API key.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConnection} className="bg-red-600 hover:bg-red-700">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={!!deleteKeyTarget} onOpenChange={() => setDeleteKeyTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete API Key</AlertDialogTitle>
            <AlertDialogDescription>This API key will stop working immediately.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteKey} className="bg-red-600 hover:bg-red-700">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={!!generateKeyTarget} onOpenChange={() => setGenerateKeyTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Generate API Key</AlertDialogTitle>
            <AlertDialogDescription>Create a new API key for this connection?</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleGenerateKey} className="bg-green-600 hover:bg-green-700">Generate</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
