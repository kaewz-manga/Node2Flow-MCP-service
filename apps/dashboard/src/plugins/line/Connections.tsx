import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { createConnection, deleteConnection } from '../../lib/gateway-api';
import { getApiKeys, createApiKey, revokeApiKey } from '../../lib/platform-api';
import type { ApiKeyInfo } from '../../lib/platform-api';
import { getConnections, useConnection, useSudoContext, type Connection, Field, FieldLabel, FieldDescription, InputGroup, InputGroupInput, InputGroupAddon, Button, Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter, Alert, AlertDescription, Badge, Dialog, DialogContent, DialogHeader, DialogTitle, Separator, AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from '@node2flow/dashboard-core';

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
  MessageCircle,
  Lock,
  Tag,
  Server,
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
  const [formAccessToken, setFormAccessToken] = useState('');
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState('');

  const [copied, setCopied] = useState(false);
  const [copiedMcp, setCopiedMcp] = useState(false);

  // AlertDialog states
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [revokeTarget, setRevokeTarget] = useState<string | null>(null);

  const mcpUrl = `${import.meta.env.VITE_GATEWAY_URL || 'https://mcp.node2flow.net'}/mcp`;

  const fetchConnections = async () => {
    setLoading(true);
    const [connRes, keysRes] = await Promise.all([
      getConnections('line'),
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

    const res = await createConnection('line', formName, {
      channel_access_token: formAccessToken.trim(),
    });

    if (res.success && res.data) {
      const keyRes = await createApiKey((res.data as any).id || (res.data as any).connection?.id);
      if (keyRes.success && keyRes.data) {
        setNewApiKey(keyRes.data.api_key);
        setShowApiKeyModal(true);
      }
      setShowAddModal(false);
      setFormName('');
      setFormAccessToken('');
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

  const getKeysForConnection = (connectionId: string) =>
    apiKeys.filter((k) => k.connection_id === connectionId);

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
          <h1 className="text-2xl font-bold text-foreground">LINE Bot Connections</h1>
          <p className="text-muted-foreground mt-1">Manage your LINE Messaging API connections</p>
        </div>
        <Button onClick={() => setShowAddModal(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Connection
        </Button>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-t from-primary/5 to-card shadow-sm">
          <CardHeader className="pb-2">
            <CardDescription>Connections</CardDescription>
            <CardTitle className="text-2xl font-semibold tabular-nums">
              {connections.length}
            </CardTitle>
          </CardHeader>
          <CardFooter className="text-sm text-muted-foreground">
            <Server className="h-3.5 w-3.5 mr-1.5 text-primary" />
            {connections.filter(c => c.status === 'active').length} active
          </CardFooter>
        </Card>

        <Card className="bg-gradient-to-t from-emerald-500/5 to-card shadow-sm">
          <CardHeader className="pb-2">
            <CardDescription>API Keys</CardDescription>
            <CardTitle className="text-2xl font-semibold tabular-nums">
              {apiKeys.length}
            </CardTitle>
          </CardHeader>
          <CardFooter className="text-sm text-muted-foreground">
            <Key className="h-3.5 w-3.5 mr-1.5 text-emerald-500" />
            {apiKeys.filter(k => k.status === 'active').length} active
          </CardFooter>
        </Card>

        <Card className="bg-gradient-to-t from-purple-500/5 to-card shadow-sm">
          <CardHeader className="pb-2">
            <CardDescription>MCP Endpoint</CardDescription>
            <CardTitle className="text-sm font-mono break-all">
              {mcpUrl}
            </CardTitle>
          </CardHeader>
          <CardFooter>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                navigator.clipboard.writeText(mcpUrl);
                setCopiedMcp(true);
                setTimeout(() => setCopiedMcp(false), 2000);
              }}
            >
              {copiedMcp ? (
                <><Check className="h-3.5 w-3.5 mr-1.5 text-emerald-400" /> Copied</>
              ) : (
                <><Copy className="h-3.5 w-3.5 mr-1.5" /> Copy URL</>
              )}
            </Button>
          </CardFooter>
        </Card>
      </div>

      <Separator />

      {!totpEnabled && (
        <Alert className="bg-amber-900/30 border-amber-700">
          <Shield className="h-5 w-5 text-amber-400" />
          <AlertDescription className="flex items-center justify-between w-full">
            <div>
              <p className="text-amber-300 font-medium">Enable Two-Factor Authentication</p>
              <p className="text-sm text-amber-300/80">
                Set up 2FA to manage connections securely
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

      {connections.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <div className="bg-muted w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <MessageCircle className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium text-foreground mb-2">No connections yet</h3>
            <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
              Add your LINE Channel Access Token to start sending messages and managing your bot.
            </p>
            <Button onClick={() => setShowAddModal(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Connection
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {connections.map((conn) => {
            const connKeys = getKeysForConnection(conn.id);
            return (
              <Card key={conn.id} className={`transition-all hover:shadow-md ${conn.status === 'active' ? 'border-l-4 border-l-emerald-500' : ''}`}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-2.5 h-2.5 rounded-full ${conn.status === 'active' ? 'bg-emerald-400' : 'bg-muted-foreground'}`} />
                      <div>
                        <CardTitle className="text-base">{conn.name}</CardTitle>
                        <CardDescription className="flex items-center gap-1.5 mt-0.5">
                          <MessageCircle className="h-3 w-3" />
                          {conn.product_type}
                          <span className="mx-1">·</span>
                          Added {new Date(conn.created_at).toLocaleDateString()}
                        </CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => handleGenerateApiKey(conn.id)}
                      >
                        <RefreshCw className="h-3 w-3 mr-1" />
                        New Key
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-muted-foreground hover:text-red-400 hover:bg-red-900/30"
                        onClick={() => handleDeleteConnection(conn.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  {connKeys.length > 0 && (
                    <>
                      <Separator className="mb-4" />
                      <h4 className="text-sm font-medium text-muted-foreground mb-2">API Keys</h4>
                      <div className="space-y-2">
                        {connKeys.map((key) => (
                          <div key={key.id} className="flex items-center justify-between py-2 px-3 bg-card rounded-lg">
                            <div className="flex items-center gap-3">
                              <Key className="h-4 w-4 text-muted-foreground" />
                              <div>
                                <code className="text-sm font-mono text-muted-foreground">{key.prefix}...</code>
                                <span className="ml-2 text-xs text-muted-foreground">{key.name}</span>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge variant="secondary" className={
                                key.status === 'active'
                                  ? 'bg-emerald-900/30 text-emerald-400'
                                  : 'bg-muted text-muted-foreground'
                              }>
                                {key.status}
                              </Badge>
                              {key.status === 'active' && (
                                <Button
                                  variant="link"
                                  size="sm"
                                  className="text-red-400 p-0 h-auto"
                                  onClick={() => handleRevokeApiKey(key.id)}
                                >
                                  Revoke
                                </Button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Add Connection Dialog */}
      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add LINE Bot Connection</DialogTitle>
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
                  placeholder="My LINE Bot"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  required
                />
              </InputGroup>
            </Field>

            <Field>
              <FieldLabel>Channel Access Token</FieldLabel>
              <InputGroup>
                <InputGroupAddon><Lock /></InputGroupAddon>
                <InputGroupInput
                  type="password"
                  placeholder="Long-lived channel access token"
                  value={formAccessToken}
                  onChange={(e) => setFormAccessToken(e.target.value)}
                  required
                />
              </InputGroup>
              <FieldDescription>
                Get your token from{' '}
                <a
                  href="https://developers.line.biz/console/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  LINE Developers Console
                </a>
                {' '}&rarr; Messaging API &rarr; Channel access token
              </FieldDescription>
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
              <div className="bg-emerald-900/30 p-2 rounded-full">
                <Check className="h-6 w-6 text-emerald-400" />
              </div>
              <DialogTitle>Your API Key</DialogTitle>
            </div>
          </DialogHeader>

          <Alert className="bg-yellow-900/30 border-yellow-600">
            <AlertDescription className="text-yellow-300">
              <strong>Important:</strong> Copy this API key now. You won't be able to see it again!
            </AlertDescription>
          </Alert>

          <div className="bg-muted rounded-lg p-3 flex items-center gap-2">
            <code className="flex-1 text-sm font-mono break-all text-foreground">{newApiKey}</code>
            <Button
              variant="secondary"
              size="icon"
              onClick={() => copyToClipboard(newApiKey)}
            >
              {copied ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
            </Button>
          </div>

          <Button
            onClick={() => { setShowApiKeyModal(false); setNewApiKey(''); }}
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
