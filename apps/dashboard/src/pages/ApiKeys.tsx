import { useState, useEffect } from 'react';
import {
  useSudoContext,
  Card,
  CardContent,
  Button,
  Input,
  Label,
  Badge,
  Alert,
  AlertDescription,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@node2flow/dashboard-core';
import {
  getApiKeys,
  createApiKey,
  revokeApiKey,
  type ApiKeyInfo,
  type ApiKeyScope,
} from '../lib/platform-api';
import { plugins } from '../plugins/registry';
import {
  Key,
  Plus,
  Loader2,
  Check,
  Copy,
  MoreHorizontal,
  AlertCircle,
  Ban,
} from 'lucide-react';
import { toast } from 'sonner';

type ScopePreset = 'full' | 'readonly' | 'custom';

function scopeLabel(scope: ApiKeyScope | null, connectionId: string): string {
  if (connectionId !== '_all') return 'Single Connection';
  if (!scope) return 'Full Access';
  if (scope.permissions?.length === 1 && scope.permissions[0] === 'read' && !scope.plugins) return 'Read Only';
  return 'Custom';
}

function ScopeBadge({ scope, connectionId }: { scope: ApiKeyScope | null; connectionId: string }) {
  const label = scopeLabel(scope, connectionId);
  if (label === 'Full Access') return <Badge>Full Access</Badge>;
  if (label === 'Read Only') return <Badge variant="secondary">Read Only</Badge>;
  if (label === 'Single Connection') return <Badge variant="outline">Connection</Badge>;
  return <Badge variant="outline">Custom</Badge>;
}

export default function ApiKeysTab() {
  const { withSudo } = useSudoContext();
  const [keys, setKeys] = useState<ApiKeyInfo[]>([]);
  const [loading, setLoading] = useState(true);

  // Create dialog
  const [showCreate, setShowCreate] = useState(false);
  const [createName, setCreateName] = useState('');
  const [preset, setPreset] = useState<ScopePreset>('full');
  const [selectedPlugins, setSelectedPlugins] = useState<string[]>(plugins.map(p => p.id));
  const [selectedPerms, setSelectedPerms] = useState<string[]>(['read', 'write', 'delete']);
  const [createLoading, setCreateLoading] = useState(false);

  // Key display dialog
  const [newApiKey, setNewApiKey] = useState('');
  const [showKeyModal, setShowKeyModal] = useState(false);
  const [copied, setCopied] = useState(false);

  // Revoke
  const [revokeTarget, setRevokeTarget] = useState<ApiKeyInfo | null>(null);

  useEffect(() => { loadKeys(); }, []);

  const loadKeys = async () => {
    setLoading(true);
    const res = await getApiKeys();
    if (res.success && res.data) setKeys(res.data.api_keys);
    setLoading(false);
  };

  const handleCreate = async () => {
    setCreateLoading(true);
    let scope: ApiKeyScope | null = null;
    if (preset === 'readonly') {
      scope = { permissions: ['read'] };
    } else if (preset === 'custom') {
      scope = {};
      if (selectedPlugins.length < plugins.length) scope.plugins = selectedPlugins;
      if (selectedPerms.length < 3) scope.permissions = selectedPerms;
      if (!scope.plugins && !scope.permissions) scope = null; // effectively full access
    }

    const res = await createApiKey(undefined, createName || 'API Key', scope);
    setCreateLoading(false);

    if (res.success && res.data) {
      setShowCreate(false);
      setNewApiKey(res.data.api_key);
      setShowKeyModal(true);
      setCreateName('');
      setPreset('full');
      await loadKeys();
    } else {
      toast.error(res.error?.message || 'Failed to create API key');
    }
  };

  const handleRevoke = async () => {
    if (!revokeTarget) return;
    await withSudo(async () => {
      const res = await revokeApiKey(revokeTarget.id);
      if (res.success) {
        toast.success('API key revoked');
        setRevokeTarget(null);
        await loadKeys();
      } else {
        toast.error(res.error?.message || 'Failed to revoke');
      }
    });
  };

  const copyToClipboard = async (text: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const togglePlugin = (id: string) => {
    setSelectedPlugins(prev =>
      prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
    );
  };

  const togglePerm = (perm: string) => {
    setSelectedPerms(prev =>
      prev.includes(perm) ? prev.filter(p => p !== perm) : [...prev, perm]
    );
  };

  const globalKeys = keys.filter(k => k.connection_id === '_all');
  const activeKeys = globalKeys.filter(k => k.status === 'active');

  return (
    <Card>
      <CardContent className="p-0">
        <div className="flex items-center justify-between p-4">
          <div>
            <h3 className="font-medium text-foreground">Global API Keys</h3>
            <p className="text-sm text-muted-foreground">
              {activeKeys.length} active key{activeKeys.length !== 1 ? 's' : ''}
            </p>
          </div>
          <Button size="sm" onClick={() => setShowCreate(true)}>
            <Plus className="h-4 w-4" /> Create Key
          </Button>
        </div>

        {loading ? (
          <div className="flex justify-center p-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : globalKeys.length === 0 ? (
          <div className="text-center p-8 text-muted-foreground">
            <Key className="h-10 w-10 mx-auto mb-3 opacity-40" />
            <p className="font-medium text-foreground">No global API keys</p>
            <p className="text-sm mt-1">Create a key to access all your services via MCP</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Key</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Scope</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Last Used</TableHead>
                <TableHead className="w-10" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {globalKeys.map(k => (
                <TableRow key={k.id}>
                  <TableCell>
                    <code className="text-xs font-mono text-muted-foreground">{k.prefix}...</code>
                  </TableCell>
                  <TableCell className="font-medium">{k.name}</TableCell>
                  <TableCell><ScopeBadge scope={k.scope} connectionId={k.connection_id} /></TableCell>
                  <TableCell>
                    {k.status === 'active'
                      ? <Badge variant="success">Active</Badge>
                      : <Badge variant="destructive">Revoked</Badge>
                    }
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {k.last_used_at ? new Date(k.last_used_at).toLocaleDateString() : 'Never'}
                  </TableCell>
                  <TableCell>
                    {k.status === 'active' && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => copyToClipboard(k.prefix)}>
                            <Copy className="h-4 w-4" /> Copy Prefix
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-red-400" onClick={() => setRevokeTarget(k)}>
                            <Ban className="h-4 w-4" /> Revoke Key
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>

      {/* Create API Key Dialog */}
      <Dialog open={showCreate} onOpenChange={(open) => { if (!open) { setShowCreate(false); setCreateName(''); setPreset('full'); } }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Global API Key</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Name</Label>
              <Input
                placeholder="My API Key"
                value={createName}
                onChange={(e) => setCreateName(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Scope</Label>
              <Select value={preset} onValueChange={(v) => setPreset(v as ScopePreset)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="full">Full Access</SelectItem>
                  <SelectItem value="readonly">Read Only</SelectItem>
                  <SelectItem value="custom">Custom</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                {preset === 'full' && 'Access all plugins with all permissions'}
                {preset === 'readonly' && 'Access all plugins but only read operations'}
                {preset === 'custom' && 'Choose specific plugins and permissions'}
              </p>
            </div>

            {preset === 'custom' && (
              <>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Plugins</Label>
                    <Button
                      variant="link"
                      size="sm"
                      className="h-auto p-0 text-xs"
                      onClick={() => setSelectedPlugins(
                        selectedPlugins.length === plugins.length ? [] : plugins.map(p => p.id)
                      )}
                    >
                      {selectedPlugins.length === plugins.length ? 'Deselect All' : 'Select All'}
                    </Button>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {plugins.map(p => (
                      <label
                        key={p.id}
                        className="flex items-center gap-2 p-2 rounded-md border cursor-pointer hover:bg-accent text-sm"
                      >
                        <input
                          type="checkbox"
                          checked={selectedPlugins.includes(p.id)}
                          onChange={() => togglePlugin(p.id)}
                          className="rounded"
                        />
                        <span>{p.name}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Permissions</Label>
                  <div className="flex gap-3">
                    {(['read', 'write', 'delete'] as const).map(perm => (
                      <label
                        key={perm}
                        className="flex items-center gap-2 p-2 rounded-md border cursor-pointer hover:bg-accent text-sm flex-1 justify-center"
                      >
                        <input
                          type="checkbox"
                          checked={selectedPerms.includes(perm)}
                          onChange={() => togglePerm(perm)}
                          className="rounded"
                        />
                        <span className="capitalize">{perm}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </>
            )}

            <div className="flex gap-3 pt-2">
              <Button variant="secondary" className="flex-1" onClick={() => { setShowCreate(false); setCreateName(''); setPreset('full'); }}>
                Cancel
              </Button>
              <Button
                className="flex-1"
                onClick={handleCreate}
                disabled={createLoading || (preset === 'custom' && (selectedPlugins.length === 0 || selectedPerms.length === 0))}
              >
                {createLoading ? <><Loader2 className="h-4 w-4 animate-spin" /> Creating...</> : 'Create Key'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* API Key Display Dialog */}
      <Dialog open={showKeyModal} onOpenChange={(open) => { if (!open) { setShowKeyModal(false); setNewApiKey(''); } }}>
        <DialogContent>
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="bg-green-900/30 p-2 rounded-full">
                <Check className="h-6 w-6 text-green-400" />
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
              {copied ? <Check className="h-4 w-4 text-green-400" /> : <Copy className="h-4 w-4" />}
            </Button>
          </div>

          <div>
            <h3 className="font-medium text-foreground mb-2">How to use this key:</h3>
            <div className="bg-card rounded-lg p-3 text-sm font-mono text-muted-foreground">
              <p className="mb-1"># In your MCP client config:</p>
              <p>Authorization: Bearer {newApiKey.substring(0, 20)}...</p>
            </div>
          </div>

          <Button onClick={() => { setShowKeyModal(false); setNewApiKey(''); }} className="w-full">
            I've saved my API key
          </Button>
        </DialogContent>
      </Dialog>

      {/* Revoke Confirmation */}
      <AlertDialog open={!!revokeTarget} onOpenChange={(open) => !open && setRevokeTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Revoke API Key</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently revoke <strong>{revokeTarget?.prefix}...</strong> ({revokeTarget?.name}).
              Any applications using this key will stop working.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleRevoke} className="bg-red-600 hover:bg-red-700">
              Revoke
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}
