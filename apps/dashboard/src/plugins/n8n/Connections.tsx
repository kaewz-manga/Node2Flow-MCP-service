import { Fragment, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { createConnection, deleteConnection } from '../../lib/gateway-api';
import { getApiKeys, createApiKey, revokeApiKey } from '../../lib/platform-api';
import type { ApiKeyInfo } from '../../lib/platform-api';
import { getConnections, useConnection, useSudoContext, type Connection, Field, FieldLabel, FieldDescription, InputGroup, InputGroupInput, InputGroupAddon, Button, Card, CardContent, CardHeader, CardTitle, Alert, AlertDescription, Badge, Dialog, DialogContent, DialogHeader, DialogTitle, AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction, Item, ItemMedia, ItemContent, ItemTitle, ItemDescription, ItemActions, ItemGroup, ItemSeparator } from '@node2flow/dashboard-core';

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
} from 'lucide-react';


export default function Connections() {
  const { withSudo, totpEnabled } = useSudoContext();
  const { activeConnection, setActiveConnectionId } = useConnection();
  const [connections, setConnections] = useState<Connection[]>([]);
  const [apiKeys, setApiKeys] = useState<ApiKeyInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showApiKeyModal, setShowApiKeyModal] = useState(false);
  const [newApiKey, setNewApiKey] = useState('');

  // Form states
  const [formName, setFormName] = useState('');
  const [formUrl, setFormUrl] = useState('');
  const [formApiKey, setFormApiKey] = useState('');
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState('');

  // Copy state
  const [copied, setCopied] = useState(false);
  const [copiedMcp, setCopiedMcp] = useState(false);

  // AlertDialog states
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [revokeTarget, setRevokeTarget] = useState<string | null>(null);

  const fetchConnections = async () => {
    setLoading(true);
    const [connRes, keysRes] = await Promise.all([
      getConnections('n8n'),
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

    const res = await createConnection('n8n', formName, { api_url: formUrl, api_key: formApiKey });

    if (res.success && res.data) {
      const keyRes = await createApiKey((res.data as any).id || (res.data as any).connection?.id);
      if (keyRes.success && keyRes.data) {
        setNewApiKey(keyRes.data.api_key);
        setShowApiKeyModal(true);
      }
      setShowAddModal(false);
      setFormName('');
      setFormUrl('');
      setFormApiKey('');
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

  const copyToClipboard = async (text: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getKeysForConnection = (connectionId: string) => {
    return apiKeys.filter((k) => k.connection_id === connectionId);
  };

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
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">n8n Connections</h1>
          <p className="text-muted-foreground mt-1">
            Manage your n8n instance connections
          </p>
        </div>
        <Button onClick={() => setShowAddModal(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Connection
        </Button>
      </div>

      {!totpEnabled && (
        <Alert className="bg-amber-900/30 border-amber-700">
          <Shield className="h-5 w-5 text-amber-400" />
          <AlertDescription className="flex items-center justify-between w-full">
            <div>
              <p className="text-amber-300 font-medium">Enable Two-Factor Authentication</p>
              <p className="text-sm text-amber-300/80">
                Set up 2FA to manage connections securely (delete, generate/revoke API keys)
              </p>
            </div>
            <Button variant="outline" asChild className="text-amber-400 border-amber-600 hover:bg-amber-900/30 shrink-0 ml-4">
              <Link to="/settings">Enable 2FA</Link>
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
      <Card>
        <CardContent className="p-0">
          <Item>
            <ItemMedia variant="icon">
              <Globe className="h-4 w-4 text-primary" />
            </ItemMedia>
            <ItemContent>
              <ItemTitle>MCP Endpoint</ItemTitle>
              <ItemDescription>
                <code className="font-mono text-xs text-foreground break-all">{mcpUrl}</code>
              </ItemDescription>
            </ItemContent>
            <ItemActions>
              <Button variant="secondary" size="sm" onClick={() => { navigator.clipboard.writeText(mcpUrl); setCopiedMcp(true); setTimeout(() => setCopiedMcp(false), 2000); }}>
                {copiedMcp ? <><Check className="h-3 w-3" /> Copied</> : <><Copy className="h-3 w-3" /> Copy URL</>}
              </Button>
            </ItemActions>
          </Item>
        </CardContent>
      </Card>

      {/* Connections List */}
      {connections.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <div className="bg-muted w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Key className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium text-foreground mb-2">
              No connections yet
            </h3>
            <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
              Add your first n8n instance to start using AI-powered automation.
            </p>
            <Button onClick={() => setShowAddModal(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Connection
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader className="pb-0">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Your Connections</CardTitle>
              <span className="text-sm text-muted-foreground">{connections.length} connection{connections.length !== 1 ? 's' : ''}</span>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <ItemGroup>
              {connections.map((conn, idx) => {
                const connKeys = getKeysForConnection(conn.id);
                return (
                  <Fragment key={conn.id}>
                    {idx > 0 && <ItemSeparator />}
                    <Item>
                      <ItemMedia variant="icon">
                        <div className={`w-2 h-2 rounded-full ${conn.status === 'active' ? 'bg-emerald-400' : 'bg-muted-foreground'}`} />
                      </ItemMedia>
                      <ItemContent>
                        <ItemTitle>{conn.name}</ItemTitle>
                        <ItemDescription>
                          {conn.product_type} · Added {new Date(conn.created_at).toLocaleDateString()}
                        </ItemDescription>
                      </ItemContent>
                      <ItemActions>
                        <Button variant="secondary" size="sm" onClick={() => handleGenerateApiKey(conn.id)}>
                          <RefreshCw className="h-3 w-3" /> New Key
                        </Button>
                        <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-red-400 hover:bg-red-900/30" onClick={() => handleDeleteConnection(conn.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </ItemActions>
                    </Item>
                    {connKeys.map((key) => (
                      <Item key={key.id} size="sm" className="pl-16">
                        <ItemMedia>
                          <Key className="h-3.5 w-3.5 text-muted-foreground" />
                        </ItemMedia>
                        <ItemContent>
                          <ItemTitle>
                            <code className="font-mono text-xs text-muted-foreground">{key.prefix}...</code>
                            <span className="text-xs text-muted-foreground font-normal">{key.name}</span>
                          </ItemTitle>
                        </ItemContent>
                        <ItemActions>
                          <Badge variant="secondary" className={key.status === 'active' ? 'bg-emerald-900/30 text-emerald-400' : 'bg-muted text-muted-foreground'}>
                            {key.status}
                          </Badge>
                          {key.status === 'active' && (
                            <Button variant="link" size="sm" className="text-red-400 p-0 h-auto" onClick={() => handleRevokeApiKey(key.id)}>
                              Revoke
                            </Button>
                          )}
                        </ItemActions>
                      </Item>
                    ))}
                  </Fragment>
                );
              })}
            </ItemGroup>
          </CardContent>
        </Card>
      )}

      {/* Add Connection Dialog */}
      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add n8n Connection</DialogTitle>
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
                <InputGroupInput
                  type="text"
                  placeholder="My n8n Instance"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  required
                />
              </InputGroup>
            </Field>

            <Field>
              <FieldLabel>n8n URL</FieldLabel>
              <InputGroup>
                <InputGroupAddon><Globe /></InputGroupAddon>
                <InputGroupInput
                  type="url"
                  placeholder="https://your-n8n.example.com"
                  value={formUrl}
                  onChange={(e) => setFormUrl(e.target.value)}
                  required
                />
              </InputGroup>
              <FieldDescription>The base URL of your n8n instance</FieldDescription>
            </Field>

            <Field>
              <FieldLabel>n8n API Key</FieldLabel>
              <InputGroup>
                <InputGroupAddon><Lock /></InputGroupAddon>
                <InputGroupInput
                  type="password"
                  placeholder="n8n_api_..."
                  value={formApiKey}
                  onChange={(e) => setFormApiKey(e.target.value)}
                  required
                />
              </InputGroup>
              <FieldDescription>Generate from n8n Settings &rarr; API</FieldDescription>
            </Field>

            <div className="flex gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => setShowAddModal(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={formLoading}
                className="flex-1"
              >
                {formLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Connecting...
                  </>
                ) : (
                  'Add Connection'
                )}
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
              <div className="bg-emerald-900/30 p-2 rounded-full">
                <Check className="h-6 w-6 text-emerald-400" />
              </div>
              <DialogTitle>Your API Key</DialogTitle>
            </div>
          </DialogHeader>

          <Alert className="bg-yellow-900/30 border-yellow-600">
            <AlertDescription className="text-yellow-300">
              <strong>Important:</strong> Copy this API key now. You won't be
              able to see it again!
            </AlertDescription>
          </Alert>

          <div className="bg-muted rounded-lg p-3 flex items-center gap-2">
            <code className="flex-1 text-sm font-mono break-all text-foreground">
              {newApiKey}
            </code>
            <Button
              variant="secondary"
              size="icon"
              onClick={() => copyToClipboard(newApiKey)}
            >
              {copied ? (
                <Check className="h-4 w-4 text-emerald-400" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
          </div>

          <div>
            <h3 className="font-medium text-foreground mb-2">
              How to use this key:
            </h3>
            <div className="bg-card rounded-lg p-3 text-sm font-mono text-muted-foreground">
              <p className="text-muted-foreground mb-1"># In your MCP client config:</p>
              <p>Authorization: Bearer {newApiKey.substring(0, 20)}...</p>
            </div>
          </div>

          <Button
            onClick={() => {
              setShowApiKeyModal(false);
              setNewApiKey('');
            }}
            className="w-full"
          >
            I've saved my API key
          </Button>
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
