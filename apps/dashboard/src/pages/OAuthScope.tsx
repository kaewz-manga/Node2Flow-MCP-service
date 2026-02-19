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
import {
  Loader2,
  Check,
  Info,
  Shield,
} from 'lucide-react';
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
  const [saved, setSaved] = useState(false);

  const [preset, setPreset] = useState<ScopePreset>('full');
  const [selectedPlugins, setSelectedPlugins] = useState<string[]>(plugins.map(p => p.id));
  const [selectedPerms, setSelectedPerms] = useState<string[]>(['read', 'write', 'delete']);

  // Track original state to detect changes
  const [originalPreset, setOriginalPreset] = useState<ScopePreset>('full');
  const [originalPlugins, setOriginalPlugins] = useState<string[]>(plugins.map(p => p.id));
  const [originalPerms, setOriginalPerms] = useState<string[]>(['read', 'write', 'delete']);

  useEffect(() => {
    async function loadScope() {
      setLoading(true);
      const res = await getOAuthScope();
      if (res.success && res.data) {
        const scope = res.data.scope;
        const p = detectPreset(scope);
        setPreset(p);
        setOriginalPreset(p);

        if (scope?.plugins) {
          setSelectedPlugins(scope.plugins);
          setOriginalPlugins(scope.plugins);
        } else {
          setSelectedPlugins(plugins.map(pl => pl.id));
          setOriginalPlugins(plugins.map(pl => pl.id));
        }

        if (scope?.permissions) {
          setSelectedPerms(scope.permissions);
          setOriginalPerms(scope.permissions);
        } else if (p === 'readonly') {
          setSelectedPerms(['read']);
          setOriginalPerms(['read']);
        } else {
          setSelectedPerms(['read', 'write', 'delete']);
          setOriginalPerms(['read', 'write', 'delete']);
        }
      }
      setLoading(false);
    }
    loadScope();
  }, []);

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
      setSaved(true);
      setOriginalPreset(preset);
      setOriginalPlugins([...selectedPlugins]);
      setOriginalPerms([...selectedPerms]);
      toast.success('MCP access scope updated');
      setTimeout(() => setSaved(false), 2000);
    } else {
      toast.error(res.error?.message || 'Failed to update scope');
    }
  };

  const hasChanges = () => {
    if (preset !== originalPreset) return true;
    if (preset === 'custom') {
      if (JSON.stringify([...selectedPlugins].sort()) !== JSON.stringify([...originalPlugins].sort())) return true;
      if (JSON.stringify([...selectedPerms].sort()) !== JSON.stringify([...originalPerms].sort())) return true;
    }
    return false;
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

  if (loading) {
    return (
      <div className="flex justify-center p-8">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Info */}
      <Alert className="bg-blue-950/20 border-blue-900/50">
        <Info className="h-4 w-4 text-blue-400" />
        <AlertDescription className="text-sm text-muted-foreground">
          This controls the <strong className="text-foreground">default access scope</strong> when you sign in via OAuth (Google/GitHub) from MCP clients like Claude Desktop.
          If you select a specific API key during OAuth login, that key's scope takes priority over this setting.
        </AlertDescription>
      </Alert>

      <Card>
        <CardContent className="p-6 space-y-6">
          <div className="flex items-center gap-3">
            <div className="bg-purple-900/30 p-2 rounded-lg">
              <Shield className="h-5 w-5 text-purple-400" />
            </div>
            <div>
              <h3 className="font-medium text-foreground">Default OAuth Scope</h3>
              <p className="text-sm text-muted-foreground">Restrict which tools are available when using OAuth login</p>
            </div>
            <div className="ml-auto">
              <Badge variant={preset === 'full' ? 'default' : preset === 'readonly' ? 'secondary' : 'outline'}>
                {preset === 'full' ? 'Full Access' : preset === 'readonly' ? 'Read Only' : 'Custom'}
              </Badge>
            </div>
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

          <Button
            onClick={handleSave}
            disabled={saving || !hasChanges() || (preset === 'custom' && (selectedPlugins.length === 0 || selectedPerms.length === 0))}
            className="w-full"
          >
            {saving ? (
              <><Loader2 className="h-4 w-4 animate-spin" /> Saving...</>
            ) : saved ? (
              <><Check className="h-4 w-4" /> Saved</>
            ) : (
              'Save Scope'
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
