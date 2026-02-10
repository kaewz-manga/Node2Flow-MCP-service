import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { notionSearch, notionQueryDatabase } from '../../lib/gateway-api';
import { usePluginConnection, Button, Input, Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter, Alert, AlertDescription, Separator, Badge } from '@node2flow/dashboard-core';

import JsonViewer from '../n8n/components/JsonViewer';
import { Loader2, RefreshCw, AlertCircle, Database, Search, ChevronRight, ChevronDown, Calendar } from 'lucide-react';

export default function DatabaseList() {
  const activeConnection = usePluginConnection('notion');
  const connectionId = activeConnection?.id;
  const [databases, setDatabases] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [expandedData, setExpandedData] = useState<any>(null);
  const [expandLoading, setExpandLoading] = useState(false);

  async function fetch() {
    if (!connectionId) return;
    setLoading(true);
    setError('');
    const res = await notionSearch(connectionId, '', 'database');
    if (res.success && res.data) {
      const d = res.data as any;
      const results = d.results || [];
      setDatabases(results);
    } else {
      setError(res.error?.message || 'Failed');
    }
    setLoading(false);
  }

  useEffect(() => { if (connectionId) fetch(); }, [connectionId]);

  async function handleSearch() {
    if (!connectionId) return;
    setSearching(true);
    setError('');
    const res = await notionSearch(connectionId, searchQuery, 'database');
    if (res.success && res.data) {
      const d = res.data as any;
      const results = d.results || [];
      setDatabases(results);
    } else {
      setError(res.error?.message || 'Failed');
    }
    setSearching(false);
  }

  async function handleExpand(db: any) {
    if (expandedId === db.id) {
      setExpandedId(null);
      setExpandedData(null);
      return;
    }
    if (!connectionId) return;
    setExpandedId(db.id);
    setExpandLoading(true);
    const res = await notionQueryDatabase(connectionId, db.id);
    if (res.success && res.data) {
      setExpandedData({ properties: db.properties, queryResults: res.data });
    } else {
      toast.error(res.error?.message || 'Failed to load database data');
      setExpandedData(null);
    }
    setExpandLoading(false);
  }

  if (!activeConnection) return <div className="text-center py-12 text-muted-foreground">No connection selected. Please select a connection from the sidebar.</div>;

  const getTitle = (db: any) => {
    if (db.title && db.title.length > 0 && db.title[0].plain_text) {
      return db.title[0].plain_text;
    }
    return 'Untitled Database';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Databases</h1>
          <p className="text-muted-foreground mt-1">{activeConnection.name} - {databases.length} databases</p>
        </div>
        <Button variant="outline" size="icon" onClick={fetch} title="Refresh">
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>

      {/* Stat Cards */}
      {!loading && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <Card className="bg-gradient-to-t from-primary/5 to-card shadow-sm">
            <CardHeader className="pb-2">
              <CardDescription>Total Databases</CardDescription>
              <CardTitle className="text-2xl font-semibold tabular-nums">{databases.length}</CardTitle>
            </CardHeader>
            <CardFooter className="text-sm text-muted-foreground">
              <Database className="h-3.5 w-3.5 mr-1.5 text-primary" />
              Notion databases found
            </CardFooter>
          </Card>
          <Card className="bg-gradient-to-t from-emerald-500/5 to-card shadow-sm">
            <CardHeader className="pb-2">
              <CardDescription>Latest Database</CardDescription>
              <CardTitle className="text-lg font-semibold truncate">
                {databases.length > 0 ? getTitle(databases[databases.length - 1]) : '-'}
              </CardTitle>
            </CardHeader>
            <CardFooter className="text-sm text-muted-foreground">
              <Database className="h-3.5 w-3.5 mr-1.5 text-emerald-500" />
              Most recently edited
            </CardFooter>
          </Card>
          <Card className="bg-gradient-to-t from-amber-500/5 to-card shadow-sm">
            <CardHeader className="pb-2">
              <CardDescription>Last Updated</CardDescription>
              <CardTitle className="text-lg font-semibold tabular-nums">
                {databases.length > 0 && databases[0]?.last_edited_time
                  ? new Date(databases[0].last_edited_time).toLocaleDateString()
                  : '-'}
              </CardTitle>
            </CardHeader>
            <CardFooter className="text-sm text-muted-foreground">
              <Calendar className="h-3.5 w-3.5 mr-1.5 text-amber-500" />
              Most recent change
            </CardFooter>
          </Card>
        </div>
      )}

      <Separator />

      {/* Search */}
      <div className="flex gap-2">
        <Input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') handleSearch(); }}
          placeholder="Search databases..."
          className="flex-1"
        />
        <Button className="bg-emerald-600 hover:bg-emerald-700 text-white" onClick={handleSearch} disabled={searching}>
          {searching ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Search className="h-4 w-4 mr-2" />} Search
        </Button>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {loading ? (
        <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
      ) : (
        <div className="space-y-3">
          {databases.map((db) => (
            <Card key={db.id} className="hover:shadow-md transition-all">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <Database className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-foreground truncate">{getTitle(db)}</h3>
                        <p className="text-xs text-muted-foreground font-mono mt-1">ID: {db.id}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          <Calendar className="h-3 w-3 inline mr-1" />
                          Last edited: {new Date(db.last_edited_time).toLocaleString()}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleExpand(db)}
                        className="shrink-0"
                      >
                        {expandedId === db.id ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                        {expandedId === db.id ? 'Collapse' : 'Expand'}
                      </Button>
                    </div>
                    {expandedId === db.id && (
                      <div className="mt-4 space-y-3">
                        {expandLoading ? (
                          <div className="flex justify-center py-4"><Loader2 className="h-5 w-5 animate-spin text-primary" /></div>
                        ) : expandedData ? (
                          <>
                            <div>
                              <h4 className="text-sm font-medium text-foreground mb-2">Properties Schema</h4>
                              <JsonViewer data={expandedData.properties} />
                            </div>
                            <div>
                              <h4 className="text-sm font-medium text-foreground mb-2">Query Results</h4>
                              <JsonViewer data={expandedData.queryResults} />
                            </div>
                          </>
                        ) : (
                          <p className="text-sm text-muted-foreground">Failed to load data</p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          {databases.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">No databases found</div>
          )}
        </div>
      )}
    </div>
  );
}
