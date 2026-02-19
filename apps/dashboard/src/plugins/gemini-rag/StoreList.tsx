import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { listStores, createStore, getStore, deleteStore } from '../../lib/gateway-api';
import {
  usePluginConnection, Button, Input, Card, CardHeader, CardTitle, CardDescription, CardFooter,
  Alert, AlertDescription, Separator, Field, FieldLabel,
  Table, TableHeader, TableBody, TableHead, TableRow, TableCell,
  Dialog, DialogContent, DialogHeader, DialogTitle,
  DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator,
  Pagination, PaginationContent, PaginationItem, PaginationPrevious, PaginationNext,
} from '@node2flow/dashboard-core';

import ConfirmDialog from '../n8n/components/ConfirmDialog';
import JsonViewer from '../n8n/components/JsonViewer';
import { Loader2, Plus, RefreshCw, AlertCircle, Database, FolderOpen, MoreHorizontal } from 'lucide-react';

const PAGE_SIZE = 20;

export default function StoreList() {
  const activeConnection = usePluginConnection('gemini-rag');
  const connectionId = activeConnection?.id;
  const [stores, setStores] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<any>(null);
  const [newDisplayName, setNewDisplayName] = useState('');
  const [creating, setCreating] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [expandedStore, setExpandedStore] = useState<string | null>(null);
  const [storeDetails, setStoreDetails] = useState<Record<string, any>>({});
  const [loadingDetail, setLoadingDetail] = useState<string | null>(null);

  // Pagination: track page tokens for back navigation
  const [pageTokens, setPageTokens] = useState<(string | null)[]>([null]);
  const [currentPage, setCurrentPage] = useState(0);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [pageLoading, setPageLoading] = useState(false);

  async function fetchPage(pageToken: string | null, isInitial = false) {
    if (!connectionId) return;
    if (isInitial) setLoading(true);
    else setPageLoading(true);
    setError('');
    const res = await listStores(connectionId, PAGE_SIZE, pageToken || undefined);
    if (res.success && res.data) {
      const d = res.data as any;
      setStores(Array.isArray(d) ? d : d.fileSearchStores || d.stores || []);
      const nextToken = d.nextPageToken || null;
      setHasNextPage(!!nextToken);
      // Store the next page token if we don't have it yet
      if (nextToken && !isInitial) {
        setPageTokens(prev => {
          const newTokens = [...prev];
          if (newTokens.length <= currentPage + 1) {
            newTokens.push(nextToken);
          } else {
            newTokens[currentPage + 1] = nextToken;
          }
          return newTokens;
        });
      } else if (nextToken && isInitial) {
        setPageTokens([null, nextToken]);
      } else if (isInitial) {
        setPageTokens([null]);
      }
    } else {
      setError(res.error?.message || 'Failed to load stores');
    }
    if (isInitial) setLoading(false);
    else setPageLoading(false);
  }

  useEffect(() => {
    if (connectionId) {
      setCurrentPage(0);
      fetchPage(null, true);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [connectionId]);

  function handlePrevPage() {
    if (currentPage <= 0) return;
    const prevPage = currentPage - 1;
    setCurrentPage(prevPage);
    fetchPage(pageTokens[prevPage]);
  }

  function handleNextPage() {
    if (!hasNextPage) return;
    const nextPage = currentPage + 1;
    setCurrentPage(nextPage);
    fetchPage(pageTokens[nextPage] || null);
  }

  async function handleCreate() {
    if (!newDisplayName.trim() || !connectionId) return;
    setCreating(true);
    const res = await createStore(connectionId, newDisplayName.trim());
    if (res.success) {
      toast.success('Store created successfully');
      setNewDisplayName('');
      setShowCreateDialog(false);
      setCurrentPage(0);
      fetchPage(null, true);
    } else {
      toast.error(res.error?.message || 'Failed to create store');
    }
    setCreating(false);
  }

  async function handleDelete() {
    if (!deleteTarget || !connectionId) return;
    const res = await deleteStore(connectionId, deleteTarget.name, true);
    if (res.success) {
      toast.success('Store deleted successfully');
      setDeleteTarget(null);
      fetchPage(pageTokens[currentPage]);
    } else {
      toast.error(res.error?.message || 'Failed to delete store');
    }
  }

  async function handleExpand(storeName: string) {
    if (expandedStore === storeName) {
      setExpandedStore(null);
      return;
    }
    setExpandedStore(storeName);
    if (!storeDetails[storeName] && connectionId) {
      setLoadingDetail(storeName);
      const res = await getStore(connectionId, storeName);
      if (res.success && res.data) {
        setStoreDetails(prev => ({ ...prev, [storeName]: res.data }));
      } else {
        toast.error('Failed to load store details');
      }
      setLoadingDetail(null);
    }
  }

  const totalDocs = stores.reduce((sum, store) => sum + (store.documentCount || 0), 0);

  if (!activeConnection) {
    return <div className="text-center py-12 text-muted-foreground">No connection selected. Please select a connection from the sidebar.</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">File Search Stores</h1>
          <p className="text-muted-foreground mt-1">
            {activeConnection.name} - Page {currentPage + 1}{hasNextPage ? '+' : ''}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="icon" onClick={() => fetchPage(pageTokens[currentPage])} title="Refresh">
            <RefreshCw className="h-4 w-4" />
          </Button>
          <Button onClick={() => setShowCreateDialog(true)}>
            <Plus className="h-4 w-4 mr-2" /> Create Store
          </Button>
        </div>
      </div>

      {/* Stat Cards */}
      {!loading && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <Card className="bg-gradient-to-t from-primary/5 to-card shadow-sm">
            <CardHeader className="pb-2">
              <CardDescription>Total Stores</CardDescription>
              <CardTitle className="text-2xl font-semibold tabular-nums">{stores.length}</CardTitle>
            </CardHeader>
            <CardFooter className="text-sm text-muted-foreground">
              <Database className="h-3.5 w-3.5 mr-1.5 text-foreground" />
              Knowledge bases
            </CardFooter>
          </Card>
          <Card className="bg-gradient-to-t from-primary/5 to-card shadow-sm">
            <CardHeader className="pb-2">
              <CardDescription>Total Documents</CardDescription>
              <CardTitle className="text-2xl font-semibold tabular-nums">{totalDocs}</CardTitle>
            </CardHeader>
            <CardFooter className="text-sm text-muted-foreground">
              <FolderOpen className="h-3.5 w-3.5 mr-1.5 text-foreground" />
              Across all stores
            </CardFooter>
          </Card>
          <Card className="bg-gradient-to-t from-primary/5 to-card shadow-sm">
            <CardHeader className="pb-2">
              <CardDescription>Latest Store</CardDescription>
              <CardTitle className="text-lg font-semibold truncate">
                {stores.length > 0 ? stores[stores.length - 1]?.displayName || '-' : '-'}
              </CardTitle>
            </CardHeader>
            <CardFooter className="text-sm text-muted-foreground">
              <Database className="h-3.5 w-3.5 mr-1.5 text-foreground" />
              Most recently created
            </CardFooter>
          </Card>
        </div>
      )}

      <Separator />

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {loading ? (
        <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
      ) : stores.length > 0 ? (
        <div className="space-y-3">
          <div className="rounded-md border border-border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Store Name</TableHead>
                  <TableHead>Documents</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {stores.map((store) => (
                  <>
                    <TableRow key={store.name}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Database className="h-4 w-4 text-foreground shrink-0" />
                          <div className="min-w-0">
                            <p className="font-medium">{store.displayName}</p>
                            <p className="text-xs text-muted-foreground font-mono truncate max-w-[300px]">{store.name}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">{store.documentCount || 0}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {store.createTime ? new Date(store.createTime).toLocaleDateString() : '-'}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="size-8">
                              <MoreHorizontal />
                              <span className="sr-only">Open menu</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleExpand(store.name)}>
                              {expandedStore === store.name ? 'Hide Details' : 'View Details'}
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => navigator.clipboard.writeText(store.name)}>
                              Copy ID
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-red-400 focus:text-red-400" onClick={() => setDeleteTarget(store)}>
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                    {expandedStore === store.name && (
                      <TableRow key={`${store.name}-detail`}>
                        <TableCell colSpan={4} className="bg-muted/30">
                          {loadingDetail === store.name ? (
                            <div className="flex items-center justify-center py-4">
                              <Loader2 className="h-4 w-4 animate-spin text-primary mr-2" />
                              <span className="text-sm text-muted-foreground">Loading details...</span>
                            </div>
                          ) : storeDetails[store.name] ? (
                            <JsonViewer data={storeDetails[store.name]} />
                          ) : (
                            <p className="text-sm text-muted-foreground">No details available</p>
                          )}
                        </TableCell>
                      </TableRow>
                    )}
                  </>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {(currentPage > 0 || hasNextPage) && (
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious onClick={handlePrevPage} disabled={currentPage === 0 || pageLoading} />
                </PaginationItem>
                <PaginationItem>
                  <span className="px-3 text-sm text-muted-foreground">Page {currentPage + 1}</span>
                </PaginationItem>
                <PaginationItem>
                  <PaginationNext onClick={handleNextPage} disabled={!hasNextPage || pageLoading} />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          )}
        </div>
      ) : (
        <div className="text-center py-8 text-muted-foreground">No stores found. Create one to get started!</div>
      )}

      {/* Create Store Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Store</DialogTitle>
          </DialogHeader>
          <Field>
            <FieldLabel>Display Name</FieldLabel>
            <Input
              value={newDisplayName}
              onChange={(e) => setNewDisplayName(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') handleCreate(); }}
              placeholder="My knowledge base..."
            />
          </Field>
          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" className="flex-1" onClick={() => { setShowCreateDialog(false); setNewDisplayName(''); }}>
              Cancel
            </Button>
            <Button className="flex-1" onClick={handleCreate} disabled={creating || !newDisplayName.trim()}>
              {creating ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Plus className="h-4 w-4 mr-2" />}
              Create
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete Store"
        message={`Delete store "${deleteTarget?.displayName}"? This will permanently remove all documents in this store.`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
