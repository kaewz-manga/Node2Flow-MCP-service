import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { createConnection, updateConnection, deleteConnection } from '../../lib/gateway-api';
import { getApiKeys, createApiKey, revokeApiKey } from '../../lib/platform-api';
import type { ApiKeyInfo } from '../../lib/platform-api';
import { getConnections, useConnection, useSudoContext, type Connection, Field, FieldLabel, FieldDescription, InputGroup, InputGroupInput, InputGroupAddon, Button, Card, CardContent, Alert, AlertTitle, AlertDescription, Badge, Table, TableHeader, TableBody, TableHead, TableRow, TableCell, Dialog, DialogContent, DialogHeader, DialogTitle, AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction, Item, ItemMedia, ItemContent, ItemTitle, ItemDescription, ItemActions, DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator } from '@node2flow/dashboard-core';

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
  Globe,
  Lock,
  Tag,
  User,
  BadgeCheck,
  MoreHorizontal,
  Pencil,
} from 'lucide-react';


export default function Connections() {
  const { withSudo, totpEnabled } = useSudoContext();
  const { activeConnection, setActiveConnectionId } = useConnection();
  const [connections, setConnections] = useState<Connection[]>([]);
  const [apiKeys, setApiKeys] = useState<ApiKeyInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [showAddModal, setShowAddModal] = useState(false);
  const [showApiKeyModal, setShowApiKeyModal] = useState(false);
  const [newApiKey, setNewApiKey] = useState('');

  const [formName, setFormName] = useState('');
  const [formUrl, setFormUrl] = useState('');
  const [formUsername, setFormUsername] = useState('');
  const [formAppPassword, setFormAppPassword] = useState('');
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState('');

  const [copied, setCopied] = useState(false);
  const [copiedMcp, setCopiedMcp] = useState(false);

  // AlertDialog states
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [revokeTarget, setRevokeTarget] = useState<string | null>(null);

  // Edit connection states
  const [editTarget, setEditTarget] = useState<{ id: string; name: string } | null>(null);
  const [editName, setEditName] = useState('');

  const fetchConnections = async () => {
    setLoading(true);
    const [connRes, keysRes] = await Promise.all([
      getConnections('wordpress'),
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
    fetchConnections();
  }, []);

  const handleAddConnection = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setFormLoading(true);

    const res = await createConnection('wordpress', formName, {
      site_url: formUrl,
      username: formUsername,
      application_password: formAppPassword.replace(/\s+/g, ''),
    });

    if (res.success && res.data) {
      const keyRes = await createApiKey((res.data as any).id || (res.data as any).connection?.id);
      if (keyRes.success && keyRes.data) {
        setNewApiKey(keyRes.data.api_key);
        setShowApiKeyModal(true);
      }
      setShowAddModal(false);
      setFormName('');
      setFormUrl('');
      setFormUsername('');
      setFormAppPassword('');
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
      if (res.success) {
        fetchConnections();
      } else {
        toast.error(res.error?.message || 'Failed to delete connection');
      }
      return true;
    });
  };

  const handleGenerateApiKey = async (connectionId: string) => {
    if (!totpEnabled) {
      toast.error('Please enable Two-Factor Authentication in Settings to perform this action.');
      return;
    }
    await withSudo(async () => {
      const res = await createApiKey(connectionId);
      if (res.success && res.data) {
        setNewApiKey(res.data.api_key);
        setShowApiKeyModal(true);
        fetchConnections();
      } else {
        toast.error(res.error?.message || 'Failed to generate API key');
      }
      return true;
    });
  };

  const handleRevokeApiKey = async (keyId: string) => {
    if (!totpEnabled) {
      toast.error('Please enable Two-Factor Authentication in Settings to perform this action.');
      return;
    }
    setRevokeTarget(keyId);
  };

  const confirmRevokeApiKey = async () => {
    if (!revokeTarget) return;
    const keyId = revokeTarget;
    setRevokeTarget(null);
    await withSudo(async () => {
      const res = await revokeApiKey(keyId);
      if (res.success) {
        fetchConnections();
      } else {
        toast.error(res.error?.message || 'Failed to revoke API key');
      }
      return true;
    });
  };

  const handleEditConnection = (conn: Connection) => {
    setEditTarget({ id: conn.id, name: conn.name });
    setEditName(conn.name);
  };

  const confirmEditConnection = async () => {
    if (!editTarget || !editName.trim()) return;
    const res = await updateConnection(editTarget.id, { name: editName.trim() });
    if (res.success) {
      toast.success('Connection renamed');
      fetchConnections();
    } else {
      toast.error(res.error?.message || 'Failed to rename connection');
    }
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
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">WordPress Connections</h1>
          <p className="text-muted-foreground mt-1">Manage your WordPress site connections</p>
        </div>
        <Button onClick={() => setShowAddModal(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Connection
        </Button>
      </div>

      {/* 2FA Status */}
      {totpEnabled ? (
        <Item variant="outline" size="sm">
          <ItemMedia>
            <BadgeCheck className="h-5 w-5 text-emerald-400" />
          </ItemMedia>
          <ItemContent>
            <ItemTitle>Two-Factor Authentication enabled</ItemTitle>
          </ItemContent>
        </Item>
      ) : (
        <Alert variant="warning">
          <Shield className="h-5 w-5" />
          <AlertTitle>Enable Two-Factor Authentication</AlertTitle>
          <AlertDescription className="flex items-center justify-between">
            <span>Set up 2FA to manage connections securely</span>
            <Button variant="outline" size="sm" asChild className="shrink-0 ml-4">
              <Link to="/settings">Enable</Link>
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-5 w-5" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* MCP Endpoint */}
      <Item variant="outline">
        <ItemMedia>
          <Globe className="h-5 w-5 text-primary" />
        </ItemMedia>
        <ItemContent>
          <ItemTitle>MCP Endpoint</ItemTitle>
          <ItemDescription>
            <code className="font-mono text-xs text-foreground break-all">{mcpUrl}</code>
          </ItemDescription>
        </ItemContent>
        <ItemActions>
          <Button variant="outline" size="sm" onClick={() => { navigator.clipboard.writeText(mcpUrl); setCopiedMcp(true); setTimeout(() => setCopiedMcp(false), 2000); }}>
            {copiedMcp ? <><Check className="h-3 w-3" /> Copied</> : <><Copy className="h-3 w-3" /> Copy URL</>}
          </Button>
        </ItemActions>
      </Item>

      {/* Connections Table */}
      {connections.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <div className="bg-muted w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Globe className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium text-foreground mb-2">
              No connections yet
            </h3>
            <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
              Add your first WordPress site to start managing it with AI.
            </p>
            <Button onClick={() => setShowAddModal(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Connection
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>API Key</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {connections.map((conn) => {
                const connKeys = getKeysForConnection(conn.id);
                return (
                  <TableRow key={conn.id}>
                    <TableCell className="font-medium">
                      {conn.name}
                      <span className="text-xs text-muted-foreground ml-2">
                        {new Date(conn.created_at).toLocaleDateString()}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge variant={conn.status === 'active' ? 'outline' : 'secondary'} className={conn.status === 'active' ? 'border-emerald-800 text-emerald-400' : ''}>
                        {conn.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {connKeys.map((key) => (
                        <code key={key.id} className="text-xs font-mono text-muted-foreground">{key.prefix}...</code>
                      ))}
                      {connKeys.length === 0 && <span className="text-xs text-muted-foreground">No keys</span>}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="size-8">
                            <MoreHorizontal />
                            <span className="sr-only">Open menu</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleEditConnection(conn)}>
                            <Pencil className="h-4 w-4" /> Edit Name
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleGenerateApiKey(conn.id)}>
                            <RefreshCw className="h-4 w-4" /> New Key
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          {connKeys.filter(k => k.status === 'active').map(key => (
                            <DropdownMenuItem key={key.id} className="text-destructive focus:text-destructive" onClick={() => handleRevokeApiKey(key.id)}>
                              <Key className="h-4 w-4" /> Revoke Key
                            </DropdownMenuItem>
                          ))}
                          <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => handleDeleteConnection(conn.id)}>
                            <Trash2 className="h-4 w-4" /> Delete
                          </DropdownMenuItem>
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

      {/* Add Connection Modal */}
      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add WordPress Connection</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAddConnection} className="space-y-4">
            {formError && (
              <Alert variant="destructive">
                <AlertDescription>{formError}</AlertDescription>
              </Alert>
            )}
            <Field>
              <FieldLabel>Connection Name</FieldLabel>
              <InputGroup>
                <InputGroupAddon><Tag /></InputGroupAddon>
                <InputGroupInput type="text" placeholder="My WordPress Site" value={formName} onChange={(e) => setFormName(e.target.value)} required />
              </InputGroup>
            </Field>
            <Field>
              <FieldLabel>Site URL</FieldLabel>
              <InputGroup>
                <InputGroupAddon><Globe /></InputGroupAddon>
                <InputGroupInput type="url" placeholder="https://example.com" value={formUrl} onChange={(e) => setFormUrl(e.target.value)} required />
              </InputGroup>
              <FieldDescription>Your WordPress site URL (without /wp-admin)</FieldDescription>
            </Field>
            <Field>
              <FieldLabel>Username</FieldLabel>
              <InputGroup>
                <InputGroupAddon><User /></InputGroupAddon>
                <InputGroupInput type="text" placeholder="admin" value={formUsername} onChange={(e) => setFormUsername(e.target.value)} required />
              </InputGroup>
              <FieldDescription>Your WordPress login username</FieldDescription>
            </Field>
            <Field>
              <FieldLabel>Application Password</FieldLabel>
              <InputGroup>
                <InputGroupAddon><Lock /></InputGroupAddon>
                <InputGroupInput type="password" placeholder="xxxx xxxx xxxx xxxx" value={formAppPassword} onChange={(e) => setFormAppPassword(e.target.value)} required />
              </InputGroup>
              <FieldDescription>
                From Users &rarr; Profile &rarr; Application Passwords (spaces will be removed automatically)
              </FieldDescription>
            </Field>
            <div className="flex gap-3 pt-2">
              <Button type="button" variant="secondary" onClick={() => setShowAddModal(false)} className="flex-1">Cancel</Button>
              <Button type="submit" disabled={formLoading} className="flex-1">
                {formLoading ? (<><Loader2 className="h-4 w-4 mr-2 animate-spin" />Connecting...</>) : 'Add Connection'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* API Key Display Modal */}
      <Dialog open={showApiKeyModal} onOpenChange={(open) => { if (!open) { setShowApiKeyModal(false); setNewApiKey(''); } }}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="bg-emerald-900/30 p-2 rounded-full">
                <Check className="h-6 w-6 text-emerald-400" />
              </div>
              <DialogTitle>Your API Key</DialogTitle>
            </div>
          </DialogHeader>
          <div className="space-y-4">
            <Alert className="bg-yellow-900/30 border-yellow-600">
              <AlertDescription className="text-yellow-300">
                <strong>Important:</strong> Copy this API key now. You won't be able to see it again!
              </AlertDescription>
            </Alert>
            <div className="bg-muted rounded-lg p-3 flex items-center gap-2">
              <code className="flex-1 text-sm font-mono break-all text-foreground">{newApiKey}</code>
              <Button variant="secondary" size="icon" onClick={() => copyToClipboard(newApiKey)}>
                {copied ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
            <Button
              onClick={() => { setShowApiKeyModal(false); setNewApiKey(''); }}
              className="w-full"
            >
              I've saved my API key
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Connection Name Dialog */}
      <Dialog open={!!editTarget} onOpenChange={(open) => !open && setEditTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Connection Name</DialogTitle>
          </DialogHeader>
          <Field>
            <FieldLabel>Connection Name</FieldLabel>
            <InputGroup>
              <InputGroupAddon><Tag /></InputGroupAddon>
              <InputGroupInput
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                placeholder="Connection name"
              />
            </InputGroup>
          </Field>
          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" className="flex-1" onClick={() => setEditTarget(null)}>Cancel</Button>
            <Button className="flex-1" onClick={confirmEditConnection} disabled={!editName.trim() || editName === editTarget?.name}>Save</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Connection Confirmation */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Connection</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this connection? All API keys will be revoked. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteConnection}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Revoke API Key Confirmation */}
      <AlertDialog open={!!revokeTarget} onOpenChange={(open) => !open && setRevokeTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Revoke API Key</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to revoke this API key? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmRevokeApiKey}>Revoke</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
