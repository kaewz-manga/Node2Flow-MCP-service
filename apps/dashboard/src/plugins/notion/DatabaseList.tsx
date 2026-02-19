import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { notionSearch, notionQueryDatabase, notionCreateDatabase } from '../../lib/gateway-api';
import {
  usePluginConnection, Button, Input, Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter,
  Alert, AlertDescription, Separator, Label,
  Dialog, DialogContent, DialogHeader, DialogFooter, DialogTitle,
  Select, SelectTrigger, SelectValue, SelectContent, SelectItem,
} from '@node2flow/dashboard-core';

import JsonViewer from '../n8n/components/JsonViewer';
import { Loader2, RefreshCw, AlertCircle, Database, Search, ChevronRight, ChevronDown, Calendar, Plus, X } from 'lucide-react';

const PROPERTY_TYPES = ['title', 'rich_text', 'number', 'select', 'checkbox', 'date', 'url', 'email'] as const;
const PAGE_SIZE = 20;

interface PropertyRow {
  name: string;
  type: string;
}

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

  // Pagination
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  // Create Database dialog
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [createTitle, setCreateTitle] = useState('');
  const [createParentPageId, setCreateParentPageId] = useState('');
  const [createProperties, setCreateProperties] = useState<PropertyRow[]>([{ name: 'Name', type: 'title' }]);
  const [creating, setCreating] = useState(false);

  async function fetchDatabases(cursor?: string) {
    if (!connectionId) return;
    if (!cursor) {
      setLoading(true);
      setError('');
    }
    const res = await notionSearch(connectionId, '', 'database', cursor || undefined, PAGE_SIZE);
    if (res.success && res.data) {
      const d = res.data as any;
      const results = d.results || [];
      if (cursor) {
        setDatabases(prev => [...prev, ...results]);
      } else {
        setDatabases(results);
      }
      setNextCursor(d.next_cursor || null);
      setHasMore(!!d.has_more);
    } else {
      setError(res.error?.message || 'Failed');
    }
    setLoading(false);
    setLoadingMore(false);
  }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { if (connectionId) fetchDatabases(); }, [connectionId]);

  async function handleSearch() {
    if (!connectionId) return;
    setSearching(true);
    setError('');
    setNextCursor(null);
    setHasMore(false);
    const res = await notionSearch(connectionId, searchQuery, 'database', undefined, PAGE_SIZE);
    if (res.success && res.data) {
      const d = res.data as any;
      const results = d.results || [];
      setDatabases(results);
      setNextCursor(d.next_cursor || null);
      setHasMore(!!d.has_more);
    } else {
      setError(res.error?.message || 'Failed');
    }
    setSearching(false);
  }

  async function handleLoadMore() {
    if (!nextCursor || loadingMore) return;
    setLoadingMore(true);
    if (searchQuery.trim()) {
      const res = await notionSearch(connectionId!, searchQuery, 'database', nextCursor, PAGE_SIZE);
      if (res.success && res.data) {
        const d = res.data as any;
        const results = d.results || [];
        setDatabases(prev => [...prev, ...results]);
        setNextCursor(d.next_cursor || null);
        setHasMore(!!d.has_more);
      } else {
        toast.error(res.error?.message || 'Failed to load more');
      }
      setLoadingMore(false);
    } else {
      await fetchDatabases(nextCursor);
    }
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

  // Create Database handlers
  function addPropertyRow() {
    setCreateProperties(prev => [...prev, { name: '', type: 'rich_text' }]);
  }

  function removePropertyRow(index: number) {
    setCreateProperties(prev => prev.filter((_, i) => i !== index));
  }

  function updatePropertyRow(index: number, field: 'name' | 'type', value: string) {
    setCreateProperties(prev => prev.map((p, i) => i === index ? { ...p, [field]: value } : p));
  }

  function resetCreateForm() {
    setCreateTitle('');
    setCreateParentPageId('');
    setCreateProperties([{ name: 'Name', type: 'title' }]);
  }

  async function handleCreateDatabase() {
    if (!connectionId || !createTitle.trim() || !createParentPageId.trim()) return;

    // Validate: must have at least one property
    const validProperties = createProperties.filter(p => p.name.trim());
    if (validProperties.length === 0) {
      toast.error('At least one property is required');
      return;
    }

    // Validate: must have exactly one title property
    const titleProps = validProperties.filter(p => p.type === 'title');
    if (titleProps.length === 0) {
      toast.error('At least one property must be of type "title"');
      return;
    }
    if (titleProps.length > 1) {
      toast.error('Only one property can be of type "title"');
      return;
    }

    setCreating(true);
    const props: Record<string, unknown> = {};
    for (const p of validProperties) {
      props[p.name.trim()] = { [p.type]: {} };
    }

    const res = await notionCreateDatabase(connectionId, createParentPageId.trim(), createTitle.trim(), props);
    if (res.success) {
      toast.success('Database created successfully');
      setShowCreateDialog(false);
      resetCreateForm();
      fetchDatabases();
    } else {
      toast.error(res.error?.message || 'Failed to create database');
    }
    setCreating(false);
  }

  if (!activeConnection) return <div className="text-center py-12 text-muted-foreground">No connection selected. Please select a connection from the sidebar.</div>;

  const getTitle = (db: any) => {
    if (db?.title && db.title.length > 0 && db.title[0]?.plain_text) {
      return db.title[0].plain_text;
    }
    return 'Untitled Database';
  };

  const subtitle = hasMore
    ? `${activeConnection.name} - ${databases.length} loaded (more available)`
    : `${activeConnection.name} - ${databases.length} databases`;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Databases</h1>
          <p className="text-muted-foreground mt-1">{subtitle}</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setShowCreateDialog(true)}>
            <Plus className="h-4 w-4 mr-2" /> Create Database
          </Button>
          <Button variant="outline" size="icon" onClick={() => fetchDatabases()} title="Refresh">
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Stat Cards */}
      {!loading && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <Card className="bg-gradient-to-t from-primary/5 to-card shadow-sm">
            <CardHeader className="pb-2">
              <CardDescription>Total Databases</CardDescription>
              <CardTitle className="text-2xl font-semibold tabular-nums">{databases.length}{hasMore ? '+' : ''}</CardTitle>
            </CardHeader>
            <CardFooter className="text-sm text-muted-foreground">
              <Database className="h-3.5 w-3.5 mr-1.5 text-primary" />
              Notion databases found
            </CardFooter>
          </Card>
          <Card className="bg-gradient-to-t from-green-500/5 to-card shadow-sm">
            <CardHeader className="pb-2">
              <CardDescription>Latest Database</CardDescription>
              <CardTitle className="text-lg font-semibold truncate">
                {databases.length > 0 ? getTitle(databases[databases.length - 1]) : '-'}
              </CardTitle>
            </CardHeader>
            <CardFooter className="text-sm text-muted-foreground">
              <Database className="h-3.5 w-3.5 mr-1.5 text-green-500" />
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
        <Button onClick={handleSearch} disabled={searching}>
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

          {/* Load More */}
          {hasMore && (
            <div className="flex justify-center pt-2">
              <Button variant="outline" onClick={handleLoadMore} disabled={loadingMore}>
                {loadingMore ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Load More
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Create Database Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={(open) => { if (!open) { setShowCreateDialog(false); resetCreateForm(); } }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Create Database</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Database Title</Label>
              <Input
                value={createTitle}
                onChange={(e) => setCreateTitle(e.target.value)}
                placeholder="My Database"
              />
            </div>
            <div className="space-y-2">
              <Label>Parent Page ID</Label>
              <Input
                value={createParentPageId}
                onChange={(e) => setCreateParentPageId(e.target.value)}
                placeholder="e.g. 12345678-abcd-1234-abcd-123456789abc"
              />
              <p className="text-xs text-muted-foreground">The ID of the Notion page where this database will be created.</p>
            </div>
            <Separator />
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Properties</Label>
                <Button variant="outline" size="sm" onClick={addPropertyRow}>
                  <Plus className="h-3.5 w-3.5 mr-1" /> Add Property
                </Button>
              </div>
              <div className="space-y-2">
                {createProperties.map((prop, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Input
                      value={prop.name}
                      onChange={(e) => updatePropertyRow(index, 'name', e.target.value)}
                      placeholder="Property name"
                      className="flex-1"
                    />
                    <Select value={prop.type} onValueChange={(val) => updatePropertyRow(index, 'type', val)}>
                      <SelectTrigger className="w-[140px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {PROPERTY_TYPES.map((t) => (
                          <SelectItem key={t} value={t}>{t}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removePropertyRow(index)}
                      disabled={createProperties.length <= 1}
                      className="shrink-0"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
              <p className="text-xs text-muted-foreground">Exactly one property must be of type "title".</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setShowCreateDialog(false); resetCreateForm(); }}>
              Cancel
            </Button>
            <Button
             
              onClick={handleCreateDatabase}
              disabled={creating || !createTitle.trim() || !createParentPageId.trim()}
            >
              {creating ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Plus className="h-4 w-4 mr-2" />}
              Create
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
