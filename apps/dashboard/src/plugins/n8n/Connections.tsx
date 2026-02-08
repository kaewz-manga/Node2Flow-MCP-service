import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { createConnection, deleteConnection } from '../../lib/gateway-api';
import { getApiKeys, createApiKey, revokeApiKey } from '../../lib/platform-api';
import type { ApiKeyInfo } from '../../lib/platform-api';
import { getConnections, useConnection, useAuth, useSudoContext, type Connection } from '@node2flow/dashboard-core';
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
  Server,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';

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

  const mcpUrl = `${import.meta.env.VITE_GATEWAY_URL || 'https://mcp.node2flow.net'}/mcp`;

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
      alert('Please enable Two-Factor Authentication in Settings to perform this action.');
      return;
    }

    if (!confirm('Are you sure you want to delete this connection? All API keys will be revoked.')) {
      return;
    }

    await withSudo(async () => {
      const res = await deleteConnection(id);
      if (res.success) {
        fetchConnections();
      } else {
        alert(res.error?.message || 'Failed to delete connection');
      }
      return true;
    });
  };

  const handleGenerateApiKey = async (connectionId: string) => {
    if (!totpEnabled) {
      alert('Please enable Two-Factor Authentication in Settings to perform this action.');
      return;
    }

    await withSudo(async () => {
      const res = await createApiKey(connectionId);
      if (res.success && res.data) {
        setNewApiKey(res.data.api_key);
        setShowApiKeyModal(true);
        fetchConnections();
      } else {
        alert(res.error?.message || 'Failed to generate API key');
      }
      return true;
    });
  };

  const handleRevokeApiKey = async (keyId: string) => {
    if (!totpEnabled) {
      alert('Please enable Two-Factor Authentication in Settings to perform this action.');
      return;
    }

    if (!confirm('Are you sure you want to revoke this API key?')) {
      return;
    }

    await withSudo(async () => {
      const res = await revokeApiKey(keyId);
      if (res.success) {
        fetchConnections();
      } else {
        alert(res.error?.message || 'Failed to revoke API key');
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

      {/* MCP URL */}
      <Card>
        <CardContent className="p-4 flex items-center justify-between gap-4">
          <div className="min-w-0">
            <p className="text-sm font-medium text-muted-foreground">MCP Endpoint</p>
            <code className="text-sm font-mono text-foreground break-all">{mcpUrl}</code>
          </div>
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
              <><Check className="h-4 w-4 text-emerald-400 mr-1" /> Copied</>
            ) : (
              <><Copy className="h-4 w-4 mr-1" /> Copy URL</>
            )}
          </Button>
        </CardContent>
      </Card>

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
        <div className="space-y-4">
          {connections.map((conn) => {
            const connKeys = getKeysForConnection(conn.id);
            return (
              <Card key={conn.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <div
                        className={`w-3 h-3 rounded-full mt-1.5 ${
                          conn.status === 'active' ? 'bg-emerald-400' : 'bg-muted-foreground'
                        }`}
                      />
                      <div>
                        <h3 className="font-semibold text-foreground">{conn.name}</h3>
                        <div className="flex items-center gap-2 mt-0.5">
                          <Server className="h-3 w-3 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">
                            {conn.product_type}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          Added {new Date(conn.created_at).toLocaleDateString()}
                        </p>
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

                  {/* API Keys */}
                  {connKeys.length > 0 && (
                    <>
                      <Separator className="my-4" />
                      <h4 className="text-sm font-medium text-muted-foreground mb-2">
                        API Keys
                      </h4>
                      <div className="space-y-2">
                        {connKeys.map((key) => (
                          <div
                            key={key.id}
                            className="flex items-center justify-between py-2 px-3 bg-card rounded-lg"
                          >
                            <div className="flex items-center gap-3">
                              <Key className="h-4 w-4 text-muted-foreground" />
                              <div>
                                <code className="text-sm font-mono text-muted-foreground">
                                  {key.prefix}...
                                </code>
                                <span className="ml-2 text-xs text-muted-foreground">
                                  {key.name}
                                </span>
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
            <DialogTitle>Add n8n Connection</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleAddConnection} className="space-y-4">
            {formError && (
              <Alert variant="destructive">
                <AlertDescription>{formError}</AlertDescription>
              </Alert>
            )}

            <div>
              <Label>Connection Name</Label>
              <Input
                type="text"
                placeholder="My n8n Instance"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                required
                className="mt-1"
              />
            </div>

            <div>
              <Label>n8n URL</Label>
              <Input
                type="url"
                placeholder="https://your-n8n.example.com"
                value={formUrl}
                onChange={(e) => setFormUrl(e.target.value)}
                required
                className="mt-1"
              />
              <p className="text-xs text-muted-foreground mt-1">
                The base URL of your n8n instance
              </p>
            </div>

            <div>
              <Label>n8n API Key</Label>
              <Input
                type="password"
                placeholder="n8n_api_..."
                value={formApiKey}
                onChange={(e) => setFormApiKey(e.target.value)}
                required
                className="mt-1"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Generate from n8n Settings &rarr; API
              </p>
            </div>

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
    </div>
  );
}
