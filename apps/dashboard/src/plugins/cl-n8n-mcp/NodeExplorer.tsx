import { useState } from 'react';
import { toast } from 'sonner';
import { searchMcpNodes, getMcpNode } from '../../lib/gateway-api';
import {
  usePluginConnection, Button, Card, CardContent,
  Input, Badge, Separator, Alert, AlertDescription,
} from '@node2flow/dashboard-core';
import JsonViewer from '../n8n/components/JsonViewer';
import {
  Loader2, Search, ChevronDown, ChevronRight, AlertCircle, Package, Info,
} from 'lucide-react';

export default function NodeExplorer() {
  const activeConnection = usePluginConnection('cl-n8n-mcp');
  const connectionId = activeConnection?.id;

  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState('');

  const [expandedNode, setExpandedNode] = useState<string | null>(null);
  const [detail, setDetail] = useState<any>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  async function handleSearch() {
    if (!connectionId || !query.trim()) return;
    setSearching(true);
    setError('');
    setSearched(true);
    setExpandedNode(null);
    const res = await searchMcpNodes(connectionId, query.trim());
    if (res.success && res.data) {
      const data = res.data as any;
      const nodes = data.nodes || data.results || (Array.isArray(data) ? data : []);
      setResults(nodes);
    } else {
      setError(res.error?.message || 'Search failed');
      setResults([]);
    }
    setSearching(false);
  }

  async function loadDetail(nodeType: string) {
    if (!connectionId) return;
    if (expandedNode === nodeType) { setExpandedNode(null); return; }
    setExpandedNode(nodeType);
    setDetailLoading(true);
    const res = await getMcpNode(connectionId, nodeType, 'full');
    if (res.success && res.data) {
      setDetail(res.data);
    } else {
      toast.error(res.error?.message || 'Failed to load node details');
      setDetail(null);
    }
    setDetailLoading(false);
  }

  function getNodeType(node: any) {
    return node.name || node.nodeType || node.type || '';
  }

  function getNodeLabel(node: any) {
    return node.displayName || node.label || node.name || 'Unknown';
  }

  if (!activeConnection) return <div className="text-center py-12 text-muted-foreground">No connection selected. Please select a connection from the sidebar.</div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Node Explorer</h1>
        <p className="text-muted-foreground mt-1">Search and explore 500+ n8n nodes</p>
      </div>

      <div className="flex gap-2">
        <Input
          placeholder="Search nodes (e.g., webhook, slack, http)..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          className="flex-1"
        />
        <Button onClick={handleSearch} disabled={searching || !query.trim()}>
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
          <p className="text-sm text-muted-foreground">{results.length} nodes found</p>
          {results.map((node, i) => {
            const nodeType = getNodeType(node);
            return (
              <Card key={nodeType || i} className="overflow-hidden hover:shadow-md transition-all">
                <div className="flex items-center gap-3 px-4 py-3 hover:bg-muted">
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => loadDetail(nodeType)}>
                    {expandedNode === nodeType ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                  </Button>
                  <Package className="h-4 w-4 text-primary shrink-0" />
                  <Button variant="link" onClick={() => loadDetail(nodeType)} className="flex-1 justify-start text-left text-sm font-medium text-foreground hover:text-primary p-0 h-auto">
                    {getNodeLabel(node)}
                  </Button>
                  <span className="text-xs text-muted-foreground font-mono hidden sm:block">{nodeType}</span>
                  {node.group && <Badge variant="secondary" className="bg-muted text-foreground">{Array.isArray(node.group) ? node.group[0] : node.group}</Badge>}
                </div>

                {expandedNode === nodeType && (
                  <div className="border-t border-border bg-muted p-4 space-y-4">
                    {detailLoading ? (
                      <div className="flex justify-center py-4"><Loader2 className="h-5 w-5 animate-spin text-primary" /></div>
                    ) : detail ? (
                      <>
                        {detail.description && (
                          <Card>
                            <CardContent className="p-3">
                              <div className="flex items-start gap-2">
                                <Info className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                                <p className="text-sm text-foreground">{detail.description}</p>
                              </div>
                            </CardContent>
                          </Card>
                        )}

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                          {detail.version && <Card><CardContent className="p-3"><p className="text-xs text-muted-foreground">Version</p><p className="text-sm font-medium text-foreground">{detail.version}</p></CardContent></Card>}
                          {detail.group && <Card><CardContent className="p-3"><p className="text-xs text-muted-foreground">Group</p><p className="text-sm font-medium text-foreground">{Array.isArray(detail.group) ? detail.group.join(', ') : detail.group}</p></CardContent></Card>}
                          {detail.properties && <Card><CardContent className="p-3"><p className="text-xs text-muted-foreground">Properties</p><p className="text-sm font-medium text-foreground">{Array.isArray(detail.properties) ? detail.properties.length : 0}</p></CardContent></Card>}
                          {detail.credentials && <Card><CardContent className="p-3"><p className="text-xs text-muted-foreground">Credentials</p><p className="text-sm font-medium text-foreground">{Array.isArray(detail.credentials) ? detail.credentials.length : 0}</p></CardContent></Card>}
                        </div>

                        <JsonViewer data={detail} title="Node Definition" />
                      </>
                    ) : null}
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      ) : searched ? (
        <div className="text-center py-8 text-muted-foreground">No nodes found for "{query}"</div>
      ) : (
        <div className="text-center py-8 text-muted-foreground">
          <Search className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p>Search for n8n nodes to explore their configuration and documentation</p>
        </div>
      )}
    </div>
  );
}
