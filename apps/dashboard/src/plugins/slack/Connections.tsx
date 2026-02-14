/**
 * Slack Plugin - Connections Page
 * Manage Slack Bot Token connections
 */

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { createConnection, updateConnection, deleteConnection } from '../../lib/gateway-api';
import { getApiKeys, createApiKey, deleteApiKey } from '../../lib/platform-api';
import type { ApiKeyInfo } from '../../lib/platform-api';
import {
  getConnections,
  useConnection,
  useSudoContext,
  type Connection,
  Button,
  Card,
  CardContent,
  Input,
  Badge,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
  Item,
  ItemMedia,
  ItemContent,
  ItemTitle,
  ItemDescription,
  ItemActions,
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
  EmptyContent,
  Field,
  FieldLabel,
  FieldDescription,
  InputGroup,
  InputGroupInput,
  InputGroupAddon,
  useIsMobile,
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
  SheetClose,
} from '@node2flow/dashboard-core';
import {
  Plus,
  Trash2,
  Key,
  Copy,
  Check,
  Loader2,
  AlertCircle,
  RefreshCw,
  MoreHorizontal,
  Pencil,
  ExternalLink,
  MessageSquare,
} from 'lucide-react';

export default function SlackConnections() {
  const { withSudo } = useSudoContext();
  const { activeConnection, setActiveConnectionId } = useConnection();
  const isMobile = useIsMobile();

  const [connections, setConnections] = useState<Connection[]>([]);
  const [apiKeys, setApiKeys] = useState<ApiKeyInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Add modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [showApiKeyModal, setShowApiKeyModal] = useState(false);
  const [newApiKey, setNewApiKey] = useState('');

  // Form
  const [formName, setFormName] = useState('');
  const [formBotToken, setFormBotToken] = useState('');
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState('');

  const [copied, setCopied] = useState(false);
  const [copiedMcp, setCopiedMcp] = useState(false);

  // AlertDialog states
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [deleteKeyTarget, setDeleteKeyTarget] = useState<string | null>(null);
  const [generateKeyTarget, setGenerateKeyTarget] = useState<string | null>(null);

  // Edit
  const [editTarget, setEditTarget] = useState<{ id: string; name: string } | null>(null);
  const [editName, setEditName] = useState('');
  const [editLoading, setEditLoading] = useState(false);

  const MCP_ENDPOINT = 'https://mcp.node2flow.net/mcp';

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      const [connRes, keysRes] = await Promise.all([
        getConnections('slack'),
        getApiKeys(),
      ]);
      if (connRes.data) setConnections(connRes.data.connections || []);
      if (keysRes.data) setApiKeys(keysRes.data.api_keys || []);
    } catch (e) {
      setError('Failed to load connections');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreate = async () => {
    if (!formName.trim() || !formBotToken.trim()) return;
    setFormLoading(true);
    setFormError('');
    try {
      const res = await createConnection('slack', formName.trim(), {
        bot_token: formBotToken.trim(),
      });
      if (res.error) {
        setFormError(res.error?.message || 'Failed to create connection');
        return;
      }
      // Auto-generate API key
      const connId = (res.data as any)?.id || (res.data as any)?.connection?.id;
      if (connId) {
        const keyRes = await createApiKey(connId);
        if (keyRes.data?.api_key) {
          setNewApiKey(keyRes.data.api_key);
          setShowApiKeyModal(true);
        }
      }
      toast.success('Connection created');
      setShowAddModal(false);
      setFormName('');
      setFormBotToken('');
      fetchData();
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = (id: string) => setDeleteTarget(id);
  const confirmDelete = async () => {
    if (!deleteTarget) return;
    await withSudo(async () => {
      const res = await deleteConnection(deleteTarget);
      if (res.error) {
        toast.error(res.error?.message || 'Operation failed');
      } else {
        toast.success('Connection deleted');
        fetchData();
      }
    });
    setDeleteTarget(null);
  };

  const handleGenerateApiKey = (connectionId: string) => setGenerateKeyTarget(connectionId);
  const confirmGenerateApiKey = async () => {
    if (!generateKeyTarget) return;
    const res = await createApiKey(generateKeyTarget);
    if (res.data?.api_key) {
      setNewApiKey(res.data.api_key);
      setShowApiKeyModal(true);
      fetchData();
    } else {
      toast.error('Failed to generate API key');
    }
    setGenerateKeyTarget(null);
  };

  const handleRevokeApiKey = (keyId: string) => setDeleteKeyTarget(keyId);
  const confirmRevokeApiKey = async () => {
    if (!deleteKeyTarget) return;
    const res = await deleteApiKey(deleteKeyTarget);
    if (res.error) {
      toast.error(res.error?.message || 'Operation failed');
    } else {
      toast.success('API key revoked');
      fetchData();
    }
    setDeleteKeyTarget(null);
  };

  const handleEdit = (conn: Connection) => {
    setEditTarget({ id: conn.id, name: conn.name });
    setEditName(conn.name);
  };

  const confirmEdit = async () => {
    if (!editTarget || !editName.trim()) return;
    setEditLoading(true);
    try {
      const res = await updateConnection(editTarget.id, { name: editName.trim() });
      if (res.error) {
        toast.error(res.error?.message || 'Operation failed');
      } else {
        toast.success('Connection updated');
        setEditTarget(null);
        fetchData();
      }
    } finally {
      setEditLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const copyMcp = () => {
    navigator.clipboard.writeText(MCP_ENDPOINT);
    setCopiedMcp(true);
    setTimeout(() => setCopiedMcp(false), 2000);
  };

  const getConnectionKeys = (connId: string) =>
    apiKeys.filter((k) => k.connection_id === connId);

  // Edit dialog — responsive
  const editForm = (
    <div className="space-y-4 p-4">
      <Field>
        <FieldLabel>Connection Name</FieldLabel>
        <Input value={editName} onChange={(e) => setEditName(e.target.value)} />
      </Field>
      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={() => setEditTarget(null)}>Cancel</Button>
        <Button onClick={confirmEdit} disabled={editLoading}>
          {editLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Save
        </Button>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Slack Connections</h2>
          <p className="text-sm text-muted-foreground">Manage Slack workspace connections</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="icon" onClick={fetchData} disabled={loading}>
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
          <Button onClick={() => setShowAddModal(true)}>
            <Plus className="mr-2 h-4 w-4" /> Add Connection
          </Button>
        </div>
      </div>

      {/* MCP Endpoint */}
      <Card>
        <CardContent className="py-3">
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground shrink-0">MCP Endpoint:</span>
            <code className="flex-1 text-sm font-mono truncate">{MCP_ENDPOINT}</code>
            <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" onClick={copyMcp}>
              {copiedMcp ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Connection List */}
      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : connections.length === 0 ? (
        <Empty>
          <EmptyHeader>
            <EmptyMedia>
              <MessageSquare className="h-10 w-10" />
            </EmptyMedia>
            <EmptyTitle>No Slack connections</EmptyTitle>
            <EmptyDescription>Add a Slack Bot Token to start managing your workspace.</EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Button onClick={() => setShowAddModal(true)}>
              <Plus className="mr-2 h-4 w-4" /> Add Connection
            </Button>
          </EmptyContent>
        </Empty>
      ) : (
        <div className="space-y-2">
          {connections.map((conn) => {
            const keys = getConnectionKeys(conn.id);
            const isActive = activeConnection?.id === conn.id;
            return (
              <Item key={conn.id} className={isActive ? 'border-green-500/50' : ''}>
                <ItemMedia>
                  <MessageSquare className="h-5 w-5" />
                </ItemMedia>
                <ItemContent onClick={() => setActiveConnectionId(conn.id)} className="cursor-pointer">
                  <ItemTitle>
                    {conn.name}
                    {isActive && <Badge variant="outline" className="ml-2 text-green-500 border-green-500/50">Active</Badge>}
                  </ItemTitle>
                  <ItemDescription>
                    Created {new Date(conn.created_at).toLocaleDateString()}
                    {conn.last_used_at && ` · Last used ${new Date(conn.last_used_at).toLocaleDateString()}`}
                    {keys.length > 0 && ` · ${keys.length} API key${keys.length > 1 ? 's' : ''}`}
                  </ItemDescription>
                </ItemContent>
                <ItemActions>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleEdit(conn)}>
                        <Pencil className="mr-2 h-4 w-4" /> Rename
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleGenerateApiKey(conn.id)}>
                        <Key className="mr-2 h-4 w-4" /> Generate API Key
                      </DropdownMenuItem>
                      {keys.map((key) => (
                        <DropdownMenuItem key={key.id} className="text-red-400 focus:text-red-400" onClick={() => handleRevokeApiKey(key.id)}>
                          <Trash2 className="mr-2 h-4 w-4" /> Revoke {key.prefix}
                        </DropdownMenuItem>
                      ))}
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="text-red-400 focus:text-red-400" onClick={() => handleDelete(conn.id)}>
                        <Trash2 className="mr-2 h-4 w-4" /> Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </ItemActions>
              </Item>
            );
          })}
        </div>
      )}

      {/* Add Connection Dialog */}
      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Slack Connection</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            {formError && <p className="text-sm text-red-500">{formError}</p>}
            <Field>
              <FieldLabel>Connection Name</FieldLabel>
              <Input
                placeholder="My Workspace"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
              />
            </Field>
            <Field>
              <FieldLabel>Bot Token</FieldLabel>
              <FieldDescription>
                Get your Bot Token from{' '}
                <a href="https://api.slack.com/apps" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">
                  Slack App Settings <ExternalLink className="inline h-3 w-3" />
                </a>
              </FieldDescription>
              <Input
                type="password"
                placeholder="xoxb-..."
                value={formBotToken}
                onChange={(e) => setFormBotToken(e.target.value)}
              />
            </Field>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowAddModal(false)}>Cancel</Button>
              <Button onClick={handleCreate} disabled={formLoading || !formName.trim() || !formBotToken.trim()}>
                {formLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Create
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* API Key Modal */}
      <Dialog open={showApiKeyModal} onOpenChange={(open) => { if (!open) { setShowApiKeyModal(false); setNewApiKey(''); } }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>API Key Generated</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">Copy this key now. You won't be able to see it again.</p>
          <InputGroup>
            <InputGroupInput readOnly value={newApiKey} className="font-mono text-sm" />
            <InputGroupAddon>
              <Button variant="secondary" size="icon" onClick={() => copyToClipboard(newApiKey)}>
                {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
              </Button>
            </InputGroupAddon>
          </InputGroup>
          <Button variant="outline" className="w-full" onClick={() => { setShowApiKeyModal(false); setNewApiKey(''); }}>
            Done
          </Button>
        </DialogContent>
      </Dialog>

      {/* Edit — responsive Dialog/Sheet */}
      {isMobile ? (
        <Sheet open={!!editTarget} onOpenChange={(open) => !open && setEditTarget(null)}>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>Rename Connection</SheetTitle>
            </SheetHeader>
            {editForm}
          </SheetContent>
        </Sheet>
      ) : (
        <Dialog open={!!editTarget} onOpenChange={(open) => !open && setEditTarget(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Rename Connection</DialogTitle>
            </DialogHeader>
            {editForm}
          </DialogContent>
        </Dialog>
      )}

      {/* Delete connection */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Connection</AlertDialogTitle>
            <AlertDialogDescription>
              This will delete the connection and all associated API keys. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction className="bg-red-600 hover:bg-red-700" onClick={confirmDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Revoke API key */}
      <AlertDialog open={!!deleteKeyTarget} onOpenChange={(open) => !open && setDeleteKeyTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Revoke API Key</AlertDialogTitle>
            <AlertDialogDescription>This API key will stop working immediately.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmRevokeApiKey}>Revoke</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Generate API key confirm */}
      <AlertDialog open={!!generateKeyTarget} onOpenChange={(open) => !open && setGenerateKeyTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Generate API Key</AlertDialogTitle>
            <AlertDialogDescription>A new API key will be generated for this connection.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmGenerateApiKey}>Generate</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
