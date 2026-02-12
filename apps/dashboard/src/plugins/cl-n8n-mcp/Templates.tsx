import { useState } from 'react';
import { toast } from 'sonner';
import { searchMcpTemplates, getMcpTemplate, deployMcpTemplate } from '../../lib/gateway-api';
import {
  usePluginConnection, Button, Card, CardContent, CardHeader, CardTitle, CardDescription,
  Input, Badge, Separator, Alert, AlertDescription,
  Dialog, DialogContent, DialogHeader, DialogFooter, DialogTitle,
} from '@node2flow/dashboard-core';
import JsonViewer from '../n8n/components/JsonViewer';
import {
  Loader2, Search, ChevronDown, ChevronRight, AlertCircle,
  Rocket, Layout, Package,
} from 'lucide-react';

export default function Templates() {
  const activeConnection = usePluginConnection('cl-n8n-mcp');
  const connectionId = activeConnection?.id;

  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState('');

  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [detail, setDetail] = useState<any>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const [deployTarget, setDeployTarget] = useState<any>(null);
  const [deployName, setDeployName] = useState('');
  const [deploying, setDeploying] = useState(false);

  async function handleSearch() {
    if (!connectionId || !query.trim()) return;
    setSearching(true);
    setError('');
    setSearched(true);
    setExpandedId(null);
    const res = await searchMcpTemplates(connectionId, query.trim());
    if (res.success && res.data) {
      const data = res.data as any;
      const templates = data.templates || data.items || data.results || data.workflows || (Array.isArray(data) ? data : []);
      setResults(templates);
    } else {
      setError(res.error?.message || 'Search failed');
      setResults([]);
    }
    setSearching(false);
  }

  async function loadDetail(id: number) {
    if (!connectionId) return;
    if (expandedId === id) { setExpandedId(null); return; }
    setExpandedId(id);
    setDetailLoading(true);
    const res = await getMcpTemplate(connectionId, id);
    if (res.success && res.data) {
      setDetail(res.data);
    } else {
      toast.error(res.error?.message || 'Failed to load template');
      setDetail(null);
    }
    setDetailLoading(false);
  }

  function openDeploy(template: any) {
    setDeployTarget(template);
    setDeployName(template.name || '');
  }

  async function handleDeploy() {
    if (!connectionId || !deployTarget) return;
    setDeploying(true);
    const res = await deployMcpTemplate(connectionId, deployTarget.id, deployName || undefined);
    if (res.success) {
      toast.success('Template deployed to your n8n instance');
      setDeployTarget(null);
    } else toast.error(res.error?.message || 'Deploy failed');
    setDeploying(false);
  }

  function getTemplateId(t: any) {
    return t.id || t.templateId;
  }

  function getTemplateName(t: any) {
    return t?.name || t?.title || 'Untitled Template';
  }

  if (!activeConnection) return <div className="text-center py-12 text-muted-foreground">No connection selected. Please select a connection from the sidebar.</div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Workflow Templates</h1>
        <p className="text-muted-foreground mt-1">Browse and deploy n8n workflow templates</p>
      </div>

      <div className="flex gap-2">
        <Input
          placeholder="Search templates (e.g., slack notification, email automation)..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          className="flex-1"
        />
        <Button className="bg-emerald-600 hover:bg-emerald-700 text-white" onClick={handleSearch} disabled={searching || !query.trim()}>
          {searching ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Search className="h-4 w-4 mr-2" />} Search
        </Button>
      </div>

      <Separator />

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {searching ? (
        <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
      ) : results.length > 0 ? (
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">{results.length} templates found</p>
          {results.map((template, i) => {
            const id = getTemplateId(template);
            return (
              <Card key={id || i} className="overflow-hidden hover:shadow-md transition-all">
                <div className="flex items-center gap-3 px-4 py-3 hover:bg-muted">
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => loadDetail(id)}>
                    {expandedId === id ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                  </Button>
                  <Layout className="h-4 w-4 text-primary shrink-0" />
                  <Button variant="link" onClick={() => loadDetail(id)} className="flex-1 justify-start text-left text-sm font-medium text-foreground hover:text-primary p-0 h-auto">
                    {getTemplateName(template)}
                  </Button>
                  <span className="text-xs text-muted-foreground font-mono hidden sm:block">#{id}</span>
                  {template.totalViews && <Badge variant="secondary" className="bg-muted text-foreground">{template.totalViews} views</Badge>}
                  <Button variant="outline" size="sm" className="text-emerald-400 border-emerald-700 hover:bg-emerald-900/30" onClick={() => openDeploy(template)}>
                    <Rocket className="h-3.5 w-3.5 mr-1" /> Deploy
                  </Button>
                </div>

                {expandedId === id && (
                  <div className="border-t border-border bg-muted p-4 space-y-4">
                    {detailLoading ? (
                      <div className="flex justify-center py-4"><Loader2 className="h-5 w-5 animate-spin text-primary" /></div>
                    ) : detail ? (
                      <>
                        {detail.description && (
                          <Card>
                            <CardContent className="p-3">
                              <p className="text-sm text-foreground">{detail.description}</p>
                            </CardContent>
                          </Card>
                        )}

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                          {detail.nodes && (
                            <Card><CardContent className="p-3"><p className="text-xs text-muted-foreground">Nodes</p><p className="text-sm font-medium text-foreground">{Array.isArray(detail.nodes) ? detail.nodes.length : 0}</p></CardContent></Card>
                          )}
                          {detail.totalViews !== undefined && (
                            <Card><CardContent className="p-3"><p className="text-xs text-muted-foreground">Views</p><p className="text-sm font-medium text-foreground">{detail.totalViews}</p></CardContent></Card>
                          )}
                          {detail.createdAt && (
                            <Card><CardContent className="p-3"><p className="text-xs text-muted-foreground">Created</p><p className="text-sm font-medium text-foreground">{new Date(detail.createdAt).toLocaleDateString()}</p></CardContent></Card>
                          )}
                          {detail.user?.username && (
                            <Card><CardContent className="p-3"><p className="text-xs text-muted-foreground">Author</p><p className="text-sm font-medium text-foreground">{detail.user.username}</p></CardContent></Card>
                          )}
                        </div>

                        {detail.nodes && Array.isArray(detail.nodes) && (
                          <Card>
                            <CardContent className="p-3">
                              <p className="text-xs text-muted-foreground mb-2">Used Nodes</p>
                              <div className="flex flex-wrap gap-1.5">
                                {detail.nodes.map((n: any, ni: number) => (
                                  <Badge key={ni} variant="secondary" className="bg-primary/10 text-primary">
                                    <Package className="h-3 w-3 mr-1" /> {n.displayName || n.type || n.name || 'Unknown'}
                                  </Badge>
                                ))}
                              </div>
                            </CardContent>
                          </Card>
                        )}

                        <div className="flex gap-2">
                          <Button className="bg-emerald-600 hover:bg-emerald-700 text-white" size="sm" onClick={() => openDeploy(detail)}>
                            <Rocket className="h-3.5 w-3.5 mr-2" /> Deploy to n8n
                          </Button>
                        </div>

                        <JsonViewer data={detail} title="Template Data" />
                      </>
                    ) : null}
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      ) : searched ? (
        <div className="text-center py-8 text-muted-foreground">No templates found for "{query}"</div>
      ) : (
        <div className="text-center py-8 text-muted-foreground">
          <Layout className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p>Search for workflow templates to browse and deploy to your n8n instance</p>
        </div>
      )}

      {/* Deploy Dialog */}
      <Dialog open={!!deployTarget} onOpenChange={(o) => !o && setDeployTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Deploy Template</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">Deploy "{getTemplateName(deployTarget)}" to your n8n instance.</p>
          <Input placeholder="Workflow name (optional)" value={deployName} onChange={(e) => setDeployName(e.target.value)} />
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeployTarget(null)}>Cancel</Button>
            <Button className="bg-emerald-600 hover:bg-emerald-700 text-white" onClick={handleDeploy} disabled={deploying}>
              {deploying ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Rocket className="h-4 w-4 mr-2" />} Deploy
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
