import { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  Button,
  Label,
  Badge,
  Alert,
  AlertDescription,
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@node2flow/dashboard-core';
import {
  getOAuthScope,
  updateOAuthScope,
  type ApiKeyScope,
} from '../lib/platform-api';
import { plugins } from '../plugins/registry';
import { Loader2, Shield, Save } from 'lucide-react';
import { toast } from 'sonner';

type ScopePreset = 'full' | 'readonly' | 'custom';

function detectPreset(scope: ApiKeyScope | null): ScopePreset {
  if (!scope) return 'full';
  if (scope.permissions?.length === 1 && scope.permissions[0] === 'read' && !scope.plugins) return 'readonly';
  return 'custom';
}

export default function OAuthScopeTab() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [currentScope, setCurrentScope] = useState<ApiKeyScope | null>(null);

  const [preset, setPreset] = useState<ScopePreset>('full');
  const [selectedPlugins, setSelectedPlugins] = useState<string[]>(plugins.map(p => p.id));
  const [selectedPerms, setSelectedPerms] = useState<string[]>(['read', 'write', 'delete']);

  useEffect(() => { loadScope(); }, []);

  const loadScope = async () => {
    setLoading(true);
    const res = await getOAuthScope();
    if (res.success && res.data) {
      const scope = res.data.scope;
      setCurrentScope(scope);
      setPreset(detectPreset(scope));
      if (scope?.plugins) setSelectedPlugins(scope.plugins);
      else setSelectedPlugins(plugins.map(p => p.id));
      if (scope?.permissions) setSelectedPerms(scope.permissions);
      else setSelectedPerms(['read', 'write', 'delete']);
    }
    setLoading(false);
  };

  const handleSave = async () => {
    setSaving(true);
    let scope: ApiKeyScope | null = null;
    if (preset === 'readonly') {
      scope = { permissions: ['read'] };
    } else if (preset === 'custom') {
      scope = {};
      if (selectedPlugins.length < plugins.length) scope.plugins = selectedPlugins;
      if (selectedPerms.length < 3) scope.permissions = selectedPerms;
      if (!scope.plugins && !scope.permissions) scope = null;
    }

    const res = await updateOAuthScope(scope);
    setSaving(false);

    if (res.success) {
      setCurrentScope(scope);
      toast.success('MCP access scope updated');
    } else {
      toast.error(res.error?.message || 'Failed to update scope');
    }
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

  const currentLabel = !currentScope ? 'Full Access'
    : currentScope.permissions?.length === 1 && currentScope.permissions[0] === 'read' && !currentScope.plugins ? 'Read Only'
    : 'Custom';

  if (loading) {
    return (
      <Card>
        <CardContent className="flex justify-center p-8">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-6 space-y-6">
        <div>
          <h3 className="font-medium text-foreground">OAuth MCP Access Scope</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Control which tools and permissions are available when connecting via OAuth (e.g. Claude Desktop with Google/GitHub login).
          </p>
        </div>

        <Alert>
          <Shield className="h-4 w-4" />
          <AlertDescription>
            Current scope: <Badge variant={currentLabel === 'Full Access' ? 'default' : 'secondary'} className="ml-1">{currentLabel}</Badge>
          </AlertDescription>
        </Alert>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Scope Preset</Label>
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

          <Button
            onClick={handleSave}
            disabled={saving || (preset === 'custom' && (selectedPlugins.length === 0 || selectedPerms.length === 0))}
            className="w-full"
          >
            {saving ? <><Loader2 className="h-4 w-4 animate-spin" /> Saving...</> : <><Save className="h-4 w-4" /> Save Scope</>}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
