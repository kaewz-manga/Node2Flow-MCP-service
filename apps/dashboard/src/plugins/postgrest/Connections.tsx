import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { createConnection, updateConnection, deleteConnection } from '../../lib/gateway-api';
import { getApiKeys, createApiKey, deleteApiKey } from '../../lib/platform-api';
import type { ApiKeyInfo } from '../../lib/platform-api';
import { getConnections, useConnection, useSudoContext, type Connection, Field, FieldLabel, FieldDescription, InputGroup, InputGroupInput, InputGroupAddon, Button, Alert, AlertTitle, AlertDescription, Table, TableHeader, TableBody, TableHead, TableRow, TableCell, Dialog, DialogContent, DialogHeader, DialogTitle, AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction, Item, ItemMedia, ItemContent, ItemTitle, ItemDescription, ItemActions, DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription, EmptyContent, useIsMobile, Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter, SheetClose } from '@node2flow/dashboard-core';

import {
  Plus,
  Trash2,
  Key,
  Copy,
  Check,
  Loader2,
  AlertCircle,
  RefreshCw,
  Shield,
  Database,
  Lock,
  Tag,
  Globe,
  MoreHorizontal,
  Pencil,
  Info,
} from 'lucide-react';

export default function Connections() {
  const { withSudo, totpEnabled, statusLoaded } = useSudoContext();
  useConnection();
  const [connections, setConnections] = useState<Connection[]>([]);
  const [apiKeys, setApiKeys] = useState<ApiKeyInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [showAddModal, setShowAddModal] = useState(false);
  const [showApiKeyModal, setShowApiKeyModal] = useState(false);
  const [newApiKey, setNewApiKey] = useState('');

  const [formName, setFormName] = useState('');
  const [formUrl, setFormUrl] = useState('');
  const [formToken, setFormToken] = useState('');
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
      getConnections('postgrest'),
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

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- initial data load
    fetchConnections();
  }, []);

  const handleAddConnection = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setFormLoading(true);

    const config: Record<string, unknown> = { base_url: formUrl.trim() };
    if (formToken.trim()) config.api_token = formToken.trim();

    const res = await createConnection('postgrest', formName, config);

    if (res.success && res.data) {
      const keyRes = await createApiKey((res.data as any).id || (res.data as any).connection?.id);
      if (keyRes.success && keyRes.data) {
        setNewApiKey(keyRes.data.api_key);
        setShowApiKeyModal(true);
      }
      setShowAddModal(false);
      setFormName('');
      setFormUrl('');
      setFormToken('');
      fetchConnections();
    } else {
      setFormError(res.error?.message || 'Failed to add connection');
    }
    setFormLoading(false);
  };

  const handleDeleteConnection = async (id: string) => {
    if (!totpEnabled) {
      toast.error('Please enable Two-Factor Authentication in Settings to perform this action.');
      return;
    }
    setDeleteTarget(id);
  };

  const confirmDeleteConnection = async () => {
    if (!deleteTarget) return;
    const id = deleteTarget;
    setDeleteTarget(null);
    await withSudo(async () => {
      const res = await deleteConnection(id);
      if (res.success) { fetchConnections(); } else { toast.error(res.error?.message || 'Failed to delete connection'); }
      return true;
    });
  };

  const confirmGenerateApiKey = async () => {
    if (!generateKeyTarget) return;
    const connectionId = generateKeyTarget;
    setGenerateKeyTarget(null);
    const res = await createApiKey(connectionId);
    if (res.success && res.data) {
      setNewApiKey(res.data.api_key);
      setShowApiKeyModal(true);
      fetchConnections();
    } else {
      toast.error(res.error?.message || 'Failed to generate API key');
    }
  };

  const confirmRevokeApiKey = async () => {
    if (!deleteKeyTarget) return;
    const keyId = deleteKeyTarget;
    setDeleteKeyTarget(null);
    const res = await deleteApiKey(keyId);
    if (res.success) { fetchConnections(); } else { toast.error(res.error?.message || 'Failed to revoke API key'); }
  };

  const confirmEditConnection = async () => {
    if (!editTarget || !editName.trim()) return;
    const res = await updateConnection(editTarget.id, { name: editName.trim() });
    if (res.success) { toast.success('Connection renamed'); fetchConnections(); } else { toast.error(res.error?.message || 'Failed to rename connection'); }
    setEditTarget(null);
  };

  const copyToClipboard = async (text: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getKeysForConnection = (connectionId: string) =>
    apiKeys.filter((k) => k.connection_id === connectionId);

  const mcpUrl = `${import.meta.env.VITE_GATEWAY_URL || 'https://mcp.node2flow.net'}/mcp`;

  if (loading) {
    return (<div className="flex items-center justify-center h-64"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>);
  }

  return (
    <div className="space-y-6 px-4 lg:px-6">
      <Item>
        <ItemMedia><img src="/logos/postgrest.png?v=2" alt="PostgREST" className="h-10 w-10" /></ItemMedia>
        <ItemContent>
          <ItemTitle>MCP Endpoint</ItemTitle>
          <ItemDescription><code className="font-mono text-xs text-foreground break-all">{mcpUrl}</code></ItemDescription>
        </ItemContent>
        <ItemActions>
          <Button variant="outline" size="sm" onClick={() => { navigator.clipboard.writeText(mcpUrl); setCopiedMcp(true); setTimeout(() => setCopiedMcp(false), 2000); }}>
            {copiedMcp ? <><Check className="h-3 w-3" /> Copied</> : <><Copy className="h-3 w-3" /> Copy URL</>}
          </Button>
        </ItemActions>
      </Item>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">PostgREST Connections</h1>
          <p className="text-muted-foreground mt-1">Manage your PostgREST server connections</p>
        </div>
        {connections.length > 0 && (
          <Button variant="outline" onClick={() => setShowAddModal(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Connection
          </Button>
        )}
      </div>

      {statusLoaded && !totpEnabled && (
        <Alert>
          <Shield className="h-5 w-5" />
          <AlertTitle>Enable Two-Factor Authentication</AlertTitle>
          <AlertDescription className="flex items-center justify-between">
            <span>Set up 2FA to manage connections securely</span>
            <Button size="sm" asChild className="shrink-0 ml-4"><Link to="/settings?tab=security">Enable</Link></Button>
          </AlertDescription>
        </Alert>
      )}

      {error && (<Alert variant="destructive"><AlertCircle className="h-5 w-5" /><AlertDescription>{error}</AlertDescription></Alert>)}

      <Alert className="bg-blue-950/20 border-blue-900/50">
        <Info className="h-4 w-4 text-blue-400" />
        <AlertDescription className="text-sm text-muted-foreground">
          <strong className="text-foreground">Connection key</strong> — Each connection has its own API key that only accesses this plugin.
          For a single key that works across all plugins, create a <strong className="text-foreground">Global API Key</strong> in Settings &rarr; API Keys.
          You can also use <strong className="text-foreground">OAuth login</strong> (Google/GitHub) from MCP clients like Claude Desktop.
        </AlertDescription>
      </Alert>

      {connections.length === 0 ? (
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon"><Database /></EmptyMedia>
            <EmptyTitle>No connections yet</EmptyTitle>
            <EmptyDescription>Add your PostgREST server URL to start querying your database.</EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Button variant="outline" onClick={() => setShowAddModal(true)}><Plus className="h-4 w-4 mr-2" />Add Connection</Button>
            <p className="text-xs text-muted-foreground">
              By connecting, you agree to our <Link to="/terms" className="underline hover:text-foreground">Terms</Link> and <Link to="/privacy" className="underline hover:text-foreground">Privacy Policy</Link>
            </p>
          </EmptyContent>
        </Empty>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-center">Name</TableHead>
                <TableHead className="text-center">Status</TableHead>
                <TableHead className="text-center">API Key</TableHead>
                <TableHead className="text-center">Created</TableHead>
                <TableHead className="text-center"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {connections.map((conn) => {
                const connKeys = getKeysForConnection(conn.id);
                return (
                  <TableRow key={conn.id}>
                    <TableCell className="font-medium text-center">{conn.name}</TableCell>
                    <TableCell className="text-center">
                      <div className={`w-2.5 h-2.5 rounded-full mx-auto ${conn.status === 'active' ? 'bg-green-400' : 'bg-muted-foreground'}`} />
                    </TableCell>
                    <TableCell className="text-center">
                      {connKeys.map((key) => (<code key={key.id} className="text-xs font-mono text-muted-foreground">{key.prefix}...</code>))}
                      {connKeys.length === 0 && <span className="text-xs text-muted-foreground">No keys</span>}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground text-center">{new Date(conn.created_at).toLocaleDateString()}</TableCell>
                    <TableCell className="text-center">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="size-8"><MoreHorizontal /><span className="sr-only">Open menu</span></Button></DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => { setEditTarget({ id: conn.id, name: conn.name }); setEditName(conn.name); }}><Pencil className="h-4 w-4" /> Edit Name</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => setGenerateKeyTarget(conn.id)}><RefreshCw className="h-4 w-4" /> New Key</DropdownMenuItem>
                          <DropdownMenuSeparator />
                          {connKeys.filter(k => k.status === 'active').map(key => (
                            <DropdownMenuItem key={key.id} className="text-red-400 focus:text-red-400" onClick={() => setDeleteKeyTarget(key.id)}><Key className="h-4 w-4" /> Revoke Key</DropdownMenuItem>
                          ))}
                          <DropdownMenuItem className="text-red-400 focus:text-red-400" onClick={() => handleDeleteConnection(conn.id)}><Trash2 className="h-4 w-4" /> Delete</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Add Connection Dialog */}
      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogContent>
          <DialogHeader><DialogTitle>Add PostgREST Connection</DialogTitle></DialogHeader>
          <form onSubmit={handleAddConnection} className="space-y-4">
            {formError && (<Alert variant="destructive"><AlertDescription>{formError}</AlertDescription></Alert>)}
            <Field>
              <FieldLabel>Connection Name</FieldLabel>
              <InputGroup><InputGroupAddon><Tag /></InputGroupAddon><InputGroupInput type="text" placeholder="Production DB" value={formName} onChange={(e) => setFormName(e.target.value)} required /></InputGroup>
            </Field>
            <Field>
              <FieldLabel>PostgREST URL</FieldLabel>
              <InputGroup><InputGroupAddon><Globe /></InputGroupAddon><InputGroupInput type="url" placeholder="https://api.example.com" value={formUrl} onChange={(e) => setFormUrl(e.target.value)} required /></InputGroup>
              <FieldDescription>Base URL of your PostgREST server</FieldDescription>
            </Field>
            <Field>
              <FieldLabel>JWT Token <span className="text-muted-foreground font-normal">(optional)</span></FieldLabel>
              <InputGroup><InputGroupAddon><Lock /></InputGroupAddon><InputGroupInput type="password" placeholder="eyJhbGci..." value={formToken} onChange={(e) => setFormToken(e.target.value)} /></InputGroup>
              <FieldDescription>Required only if your server uses JWT authentication</FieldDescription>
            </Field>
            <div className="flex gap-3 pt-2">
              <Button type="button" variant="outline" className="flex-1" onClick={() => setShowAddModal(false)}>Cancel</Button>
              <Button type="submit" disabled={formLoading} className="flex-1">
                {formLoading ? (<><Loader2 className="h-4 w-4 mr-2 animate-spin" />Connecting...</>) : 'Add Connection'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* API Key Display Dialog */}
      <Dialog open={showApiKeyModal} onOpenChange={(open) => { if (!open) { setShowApiKeyModal(false); setNewApiKey(''); } }}>
        <DialogContent>
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="bg-green-900/30 p-2 rounded-full"><Check className="h-6 w-6 text-green-400" /></div>
              <DialogTitle>Your API Key</DialogTitle>
            </div>
          </DialogHeader>
          <Alert className="bg-yellow-900/30 border-yellow-600"><AlertDescription className="text-yellow-300"><strong>Important:</strong> Copy this API key now. You won't be able to see it again!</AlertDescription></Alert>
          <div className="bg-muted rounded-lg p-3 flex items-center gap-2">
            <code className="flex-1 text-sm font-mono break-all text-foreground">{newApiKey}</code>
            <Button variant="secondary" size="icon" onClick={() => copyToClipboard(newApiKey)}>{copied ? <Check className="h-4 w-4 text-green-400" /> : <Copy className="h-4 w-4" />}</Button>
          </div>
          <Button onClick={() => { setShowApiKeyModal(false); setNewApiKey(''); }} className="w-full">I've saved my API key</Button>
        </DialogContent>
      </Dialog>

      {/* Edit Connection Name */}
      {isMobile ? (
        <Sheet open={!!editTarget} onOpenChange={(open) => !open && setEditTarget(null)}>
          <SheetContent side="bottom">
            <SheetHeader><SheetTitle>Edit Connection Name</SheetTitle></SheetHeader>
            <div className="px-4 py-3">
              <Field><FieldLabel>Connection Name</FieldLabel><InputGroup><InputGroupAddon><Tag /></InputGroupAddon><InputGroupInput type="text" value={editName} onChange={(e) => setEditName(e.target.value)} placeholder="Connection name" /></InputGroup></Field>
            </div>
            <SheetFooter className="px-4 pb-4">
              <SheetClose asChild><Button variant="outline" className="flex-1">Cancel</Button></SheetClose>
              <Button className="flex-1" onClick={confirmEditConnection} disabled={!editName.trim() || editName === editTarget?.name}>Save</Button>
            </SheetFooter>
          </SheetContent>
        </Sheet>
      ) : (
        <Dialog open={!!editTarget} onOpenChange={(open) => !open && setEditTarget(null)}>
          <DialogContent>
            <DialogHeader><DialogTitle>Edit Connection Name</DialogTitle></DialogHeader>
            <Field><FieldLabel>Connection Name</FieldLabel><InputGroup><InputGroupAddon><Tag /></InputGroupAddon><InputGroupInput type="text" value={editName} onChange={(e) => setEditName(e.target.value)} placeholder="Connection name" /></InputGroup></Field>
            <div className="flex gap-3 pt-2">
              <Button type="button" variant="outline" className="flex-1" onClick={() => setEditTarget(null)}>Cancel</Button>
              <Button className="flex-1" onClick={confirmEditConnection} disabled={!editName.trim() || editName === editTarget?.name}>Save</Button>
            </div>
          </DialogContent>
        </Dialog>
      )}

      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Delete Connection</AlertDialogTitle><AlertDialogDescription>Are you sure you want to delete this connection? All API keys will be deleted. This action cannot be undone.</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={confirmDeleteConnection}>Delete</AlertDialogAction></AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={!!deleteKeyTarget} onOpenChange={(open) => !open && setDeleteKeyTarget(null)}>
        <AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Revoke API Key</AlertDialogTitle><AlertDialogDescription>Are you sure you want to revoke this API key? This action cannot be undone.</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={confirmRevokeApiKey}>Revoke</AlertDialogAction></AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={!!generateKeyTarget} onOpenChange={(open) => !open && setGenerateKeyTarget(null)}>
        <AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Generate New API Key</AlertDialogTitle><AlertDialogDescription>A new API key will be generated for this connection. Make sure to copy it — you won't be able to see it again.</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={confirmGenerateApiKey}>Generate</AlertDialogAction></AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
