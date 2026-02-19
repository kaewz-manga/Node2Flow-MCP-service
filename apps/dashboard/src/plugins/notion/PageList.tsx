import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { notionSearch, notionGetPage } from '../../lib/gateway-api';
import { usePluginConnection, Button, Input, Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter, Alert, AlertDescription, Separator } from '@node2flow/dashboard-core';

import JsonViewer from '../n8n/components/JsonViewer';
import { Loader2, RefreshCw, AlertCircle, FileText, Search, ChevronRight, ChevronDown, Calendar, ExternalLink } from 'lucide-react';

const PAGE_SIZE = 20;

export default function PageList() {
  const activeConnection = usePluginConnection('notion');
  const connectionId = activeConnection?.id;
  const [pages, setPages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [expandedData, setExpandedData] = useState<any>(null);
  const [expandLoading, setExpandLoading] = useState(false);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  async function fetch() {
    if (!connectionId) return;
    setLoading(true);
    setError('');
    setNextCursor(null);
    setHasMore(false);
    const res = await notionSearch(connectionId, '', 'page', undefined, PAGE_SIZE);
    if (res.success && res.data) {
      const d = res.data as any;
      const results = d.results || [];
      setPages(results);
      setNextCursor(d.next_cursor || null);
      setHasMore(!!d.has_more);
    } else {
      setError(res.error?.message || 'Failed');
    }
    setLoading(false);
  }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { if (connectionId) fetch(); }, [connectionId]);

  async function handleSearch() {
    if (!connectionId) return;
    setSearching(true);
    setError('');
    setNextCursor(null);
    setHasMore(false);
    const res = await notionSearch(connectionId, searchQuery, 'page', undefined, PAGE_SIZE);
    if (res.success && res.data) {
      const d = res.data as any;
      const results = d.results || [];
      setPages(results);
      setNextCursor(d.next_cursor || null);
      setHasMore(!!d.has_more);
    } else {
      setError(res.error?.message || 'Failed');
    }
    setSearching(false);
  }

  async function handleLoadMore() {
    if (!connectionId || !nextCursor) return;
    setLoadingMore(true);
    const res = await notionSearch(connectionId, searchQuery, 'page', nextCursor, PAGE_SIZE);
    if (res.success && res.data) {
      const d = res.data as any;
      const results = d.results || [];
      setPages(prev => [...prev, ...results]);
      setNextCursor(d.next_cursor || null);
      setHasMore(!!d.has_more);
    } else {
      toast.error(res.error?.message || 'Failed to load more pages');
    }
    setLoadingMore(false);
  }

  async function handleExpand(page: any) {
    if (expandedId === page.id) {
      setExpandedId(null);
      setExpandedData(null);
      return;
    }
    if (!connectionId) return;
    setExpandedId(page.id);
    setExpandLoading(true);
    const res = await notionGetPage(connectionId, page.id);
    if (res.success && res.data) {
      setExpandedData(res.data);
    } else {
      toast.error(res.error?.message || 'Failed to load page details');
      setExpandedData(null);
    }
    setExpandLoading(false);
  }

  if (!activeConnection) return <div className="text-center py-12 text-muted-foreground">No connection selected. Please select a connection from the sidebar.</div>;

  const getTitle = (page: any) => {
    if (page.properties) {
      const titleProp = Object.values(page.properties).find((p: any) => p.type === 'title') as any;
      if (titleProp?.title && titleProp.title.length > 0 && titleProp.title[0].plain_text) {
        return titleProp.title[0].plain_text;
      }
    }
    return 'Untitled Page';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Pages</h1>
          <p className="text-muted-foreground mt-1">
            {activeConnection.name} - {pages.length} {hasMore ? 'loaded (more available)' : 'pages'}
          </p>
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
              <CardDescription>Total Pages</CardDescription>
              <CardTitle className="text-2xl font-semibold tabular-nums">{pages.length}{hasMore ? '+' : ''}</CardTitle>
            </CardHeader>
            <CardFooter className="text-sm text-muted-foreground">
              <FileText className="h-3.5 w-3.5 mr-1.5 text-primary" />
              Notion pages found
            </CardFooter>
          </Card>
          <Card className="bg-gradient-to-t from-green-500/5 to-card shadow-sm">
            <CardHeader className="pb-2">
              <CardDescription>Latest Page</CardDescription>
              <CardTitle className="text-lg font-semibold truncate">
                {pages.length > 0 ? getTitle(pages[pages.length - 1]) : '-'}
              </CardTitle>
            </CardHeader>
            <CardFooter className="text-sm text-muted-foreground">
              <FileText className="h-3.5 w-3.5 mr-1.5 text-green-500" />
              Most recently edited
            </CardFooter>
          </Card>
          <Card className="bg-gradient-to-t from-amber-500/5 to-card shadow-sm">
            <CardHeader className="pb-2">
              <CardDescription>Last Updated</CardDescription>
              <CardTitle className="text-lg font-semibold tabular-nums">
                {pages.length > 0 && pages[0]?.last_edited_time
                  ? new Date(pages[0].last_edited_time).toLocaleDateString()
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
          placeholder="Search pages..."
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
          {pages.map((page) => (
            <Card key={page.id} className="hover:shadow-md transition-all">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <FileText className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-foreground truncate">{getTitle(page)}</h3>
                        <p className="text-xs text-muted-foreground font-mono mt-1">ID: {page.id}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          <Calendar className="h-3 w-3 inline mr-1" />
                          Last edited: {new Date(page.last_edited_time).toLocaleString()}
                        </p>
                        {page.url && (
                          <a
                            href={page.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-primary hover:underline mt-1 inline-flex items-center gap-1"
                          >
                            Open in Notion <ExternalLink className="h-3 w-3" />
                          </a>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleExpand(page)}
                        className="shrink-0"
                      >
                        {expandedId === page.id ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                        {expandedId === page.id ? 'Collapse' : 'Expand'}
                      </Button>
                    </div>
                    {expandedId === page.id && (
                      <div className="mt-4">
                        {expandLoading ? (
                          <div className="flex justify-center py-4"><Loader2 className="h-5 w-5 animate-spin text-primary" /></div>
                        ) : expandedData ? (
                          <>
                            <h4 className="text-sm font-medium text-foreground mb-2">Full Properties</h4>
                            <JsonViewer data={expandedData} />
                          </>
                        ) : (
                          <p className="text-sm text-muted-foreground">Failed to load page details</p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          {pages.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">No pages found</div>
          )}
          {hasMore && (
            <div className="flex justify-center pt-4">
              <Button
                variant="outline"
                onClick={handleLoadMore}
                disabled={loadingMore}
              >
                {loadingMore ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                {loadingMore ? 'Loading...' : 'Load More'}
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
