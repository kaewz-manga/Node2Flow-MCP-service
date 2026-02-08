import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { createConnection, deleteConnection } from '../../lib/gateway-api';
import { getApiKeys, createApiKey, revokeApiKey } from '../../lib/platform-api';
import type { ApiKeyInfo } from '../../lib/platform-api';
import { getConnections, useConnection, useSudoContext, type Connection, Field, FieldLabel, FieldDescription, InputGroup, InputGroupInput, InputGroupAddon, Button, Card, CardContent, Alert, AlertTitle, AlertDescription, Badge, Table, TableHeader, TableBody, TableHead, TableRow, TableCell, Dialog, DialogContent, DialogHeader, DialogTitle, AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction, Item, ItemMedia, ItemContent, ItemTitle, ItemDescription, ItemActions } from '@node2flow/dashboard-core';

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
  Send,
  Globe,
  Lock,
  Tag,
  BadgeCheck,
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
  const [formBotToken, setFormBotToken] = useState('');
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState('');

  const [copied, setCopied] = useState(false);
  const [copiedMcp, setCopiedMcp] = useState(false);

  // AlertDialog states
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [revokeTarget, setRevokeTarget] = useState<string | null>(null);

  const fetchConnections = async () => {
    setLoading(true);
    const [connRes, keysRes] = await Promise.all([
      getConnections('telegram'),
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

    const res = await createConnection('telegram', formName, {
      bot_token: formBotToken.trim(),
    });

    if (res.success && res.data) {
      const keyRes = await createApiKey((res.data as any).id || (res.data as any).connection?.id);
      if (keyRes.success && keyRes.data) {
        setNewApiKey(keyRes.data.api_key);
        setShowApiKeyModal(true);
      }
      setShowAddModal(false);
      setFormName('');
      setFormBotToken('');
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
          <h1 className="text-2xl font-bold text-foreground">Telegram Bot Connections</h1>
          <p className="text-muted-foreground mt-1">Manage your Telegram Bot API connections</p>
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

      {connections.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <div className="bg-muted w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Send className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium text-foreground mb-2">No connections yet</h3>
            <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
              Add your Bot Token from @BotFather to start managing your Telegram bot.
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
                        <div key={key.id} className="flex items-center gap-2">
                          <code className="text-xs font-mono text-muted-foreground">{key.prefix}...</code>
                          <Badge variant="secondary" className={key.status === 'active' ? 'bg-emerald-900/30 text-emerald-400' : ''}>
                            {key.status}
                          </Badge>
                          {key.status === 'active' && (
                            <Button variant="link" size="sm" className="text-red-400 p-0 h-auto" onClick={() => handleRevokeApiKey(key.id)}>
                              Revoke
                            </Button>
                          )}
                        </div>
                      ))}
                      {connKeys.length === 0 && <span className="text-xs text-muted-foreground">No keys</span>}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="secondary" size="sm" onClick={() => handleGenerateApiKey(conn.id)}>
                          <RefreshCw className="h-3 w-3" /> New Key
                        </Button>
                        <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-red-400 hover:bg-red-900/30" onClick={() => handleDeleteConnection(conn.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
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
          <DialogHeader>
            <DialogTitle>Add Telegram Bot Connection</DialogTitle>
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
                <InputGroupInput type="text" placeholder="My Telegram Bot" value={formName} onChange={(e) => setFormName(e.target.value)} required />
              </InputGroup>
            </Field>
            <Field>
              <FieldLabel>Bot Token</FieldLabel>
              <InputGroup>
                <InputGroupAddon><Lock /></InputGroupAddon>
                <InputGroupInput type="password" placeholder="123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11" value={formBotToken} onChange={(e) => setFormBotToken(e.target.value)} required />
              </InputGroup>
              <FieldDescription>
                Get your token from{' '}
                <a
                  href="https://t.me/botfather"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  @BotFather
                </a>
                {' '}&mdash; send /newbot and follow the prompts
              </FieldDescription>
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
