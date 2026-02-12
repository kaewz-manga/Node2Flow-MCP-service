import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { listStores, listDocuments, deleteDocument, uploadToStore, ragQuery } from '../../lib/gateway-api';
import {
  usePluginConnection, Button, Input, Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter,
  Alert, AlertDescription, Separator, Badge, Label, Textarea,
  Select, SelectTrigger, SelectValue, SelectContent, SelectItem,
  Collapsible, CollapsibleTrigger, CollapsibleContent,
  Table, TableHeader, TableBody, TableHead, TableRow, TableCell,
  DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator,
} from '@node2flow/dashboard-core';

import ConfirmDialog from '../n8n/components/ConfirmDialog';
import { Loader2, Plus, X, RefreshCw, AlertCircle, FileText, Upload, Search, Trash2, ChevronDown, Database, Settings, MoreHorizontal, File } from 'lucide-react';

// Metadata row type
interface MetadataRow {
  key: string;
  type: 'string' | 'number' | 'stringList';
  value: string;
}

const MAX_METADATA_ROWS = 20;
const PAGE_SIZE = 20;

export default function DocumentList() {
  const activeConnection = usePluginConnection('gemini-rag');
  const connectionId = activeConnection?.id;

  // Store selection
  const [stores, setStores] = useState<any[]>([]);
  const [selectedStore, setSelectedStore] = useState<string>('');
  const [loadingStores, setLoadingStores] = useState(true);

  // Documents
  const [documents, setDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<any>(null);

  // Pagination
  const [nextPageToken, setNextPageToken] = useState<string | null>(null);
  const [loadingMore, setLoadingMore] = useState(false);

  // Upload
  const [uploadDisplayName, setUploadDisplayName] = useState('');
  const [uploadContent, setUploadContent] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadFile, setUploadFile] = useState<{ name: string; mimeType: string; base64: string } | null>(null);

  // Custom metadata
  const [metadataRows, setMetadataRows] = useState<MetadataRow[]>([]);
  const [metadataOpen, setMetadataOpen] = useState(false);

  // RAG Query
  const [query, setQuery] = useState('');
  const [queryResult, setQueryResult] = useState<any>(null);
  const [querying, setQuerying] = useState(false);

  // Load stores on mount
  useEffect(() => {
    async function fetchStores() {
      if (!connectionId) return;
      setLoadingStores(true);
      const res = await listStores(connectionId);
      if (res.success && res.data) {
        const d = res.data as any;
        const storeList = Array.isArray(d) ? d : d.fileSearchStores || d.stores || [];
        setStores(storeList);
        if (storeList.length > 0) {
          setSelectedStore(storeList[0].name); // Auto-select first store
        }
      }
      setLoadingStores(false);
    }
    fetchStores();
  }, [connectionId]);

  // Load documents when store selected
  useEffect(() => {
    if (selectedStore && connectionId) {
      fetchDocuments();
    }
  }, [selectedStore, connectionId]);

  async function fetchDocuments() {
    if (!connectionId || !selectedStore) return;
    setLoading(true);
    setError('');
    setDocuments([]);
    setNextPageToken(null);
    const res = await listDocuments(connectionId, selectedStore, PAGE_SIZE);
    if (res.success && res.data) {
      const d = res.data as any;
      setDocuments(Array.isArray(d) ? d : d.documents || []);
      setNextPageToken(d.nextPageToken || null);
    } else {
      setError(res.error?.message || 'Failed to load documents');
    }
    setLoading(false);
  }

  async function handleLoadMore() {
    if (!connectionId || !selectedStore || !nextPageToken) return;
    setLoadingMore(true);
    const res = await listDocuments(connectionId, selectedStore, PAGE_SIZE, nextPageToken);
    if (res.success && res.data) {
      const d = res.data as any;
      const newDocs = Array.isArray(d) ? d : d.documents || [];
      setDocuments(prev => [...prev, ...newDocs]);
      setNextPageToken(d.nextPageToken || null);
    } else {
      toast.error(res.error?.message || 'Failed to load more documents');
    }
    setLoadingMore(false);
  }

  async function handleDelete() {
    if (!deleteTarget || !connectionId) return;
    const res = await deleteDocument(connectionId, deleteTarget.name, true);
    if (res.success) {
      toast.success('Document deleted successfully');
      setDeleteTarget(null);
      fetchDocuments();
    } else {
      toast.error(res.error?.message || 'Failed to delete document');
    }
  }

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = (reader.result as string).split(',')[1]; // strip data:...;base64,
      setUploadFile({ name: file.name, mimeType: file.type || 'application/octet-stream', base64 });
      if (!uploadDisplayName.trim()) setUploadDisplayName(file.name);
    };
    reader.readAsDataURL(file);
    e.target.value = ''; // reset so same file can be re-selected
  }

  async function handleUpload() {
    const hasContent = uploadFile || uploadContent.trim();
    if (!hasContent || !connectionId || !selectedStore) return;
    setUploading(true);

    // Build metadata for the API call
    const metadata = metadataRows
      .filter(r => r.key.trim())
      .map(r => {
        const m: any = { key: r.key };
        if (r.type === 'string') m.stringValue = r.value;
        else if (r.type === 'number') m.numericValue = parseFloat(r.value) || 0;
        else if (r.type === 'stringList') m.stringListValue = { values: r.value.split(',').map(v => v.trim()).filter(Boolean) };
        return m;
      });

    const data = uploadFile
      ? { mimeType: uploadFile.mimeType, content: uploadFile.base64, contentEncoding: 'base64' as const, displayName: uploadDisplayName.trim() || uploadFile.name }
      : { mimeType: 'text/plain', content: uploadContent, displayName: uploadDisplayName.trim() || 'Untitled Document' };

    const res = await uploadToStore(connectionId, selectedStore, data, metadata.length > 0 ? metadata : undefined);
    if (res.success) {
      toast.success('Document uploaded successfully');
      setUploadDisplayName('');
      setUploadContent('');
      setUploadFile(null);
      setMetadataRows([]);
      setMetadataOpen(false);
      fetchDocuments();
    } else {
      toast.error(res.error?.message || 'Failed to upload document');
    }
    setUploading(false);
  }

  async function handleQuery() {
    if (!query.trim() || !connectionId || !selectedStore) return;
    setQuerying(true);
    setQueryResult(null);
    const res = await ragQuery(connectionId, query, [selectedStore]);
    if (res.success && res.data) {
      setQueryResult(res.data);
      toast.success('Query completed');
    } else {
      toast.error(res.error?.message || 'Query failed');
    }
    setQuerying(false);
  }

  // Metadata row helpers
  function addMetadataRow() {
    if (metadataRows.length >= MAX_METADATA_ROWS) return;
    setMetadataRows(prev => [...prev, { key: '', type: 'string', value: '' }]);
  }

  function removeMetadataRow(index: number) {
    setMetadataRows(prev => prev.filter((_, i) => i !== index));
  }

  function updateMetadataRow(index: number, field: keyof MetadataRow, val: string) {
    setMetadataRows(prev => prev.map((r, i) => i === index ? { ...r, [field]: val } : r));
  }

  // Get the display text for store option, showing actual loaded count for selected store
  function getStoreOptionText(store: any) {
    const docCount = store.name === selectedStore ? documents.length : (store.documentCount || 0);
    return `${store.displayName} (${docCount} docs)`;
  }

  if (!activeConnection) {
    return <div className="text-center py-12 text-muted-foreground">No connection selected. Please select a connection from the sidebar.</div>;
  }

  // Show store selector if no store selected yet
  if (loadingStores) {
    return <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;
  }

  if (stores.length === 0) {
    return (
      <div className="text-center py-12">
        <Database className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-medium text-foreground mb-2">No stores found</h3>
        <p className="text-sm text-muted-foreground">Create a store first in the Stores page.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Documents</h1>
          <p className="text-muted-foreground mt-1">{activeConnection.name} - {documents.length} documents in selected store</p>
        </div>
        <Button variant="outline" size="icon" onClick={fetchDocuments} title="Refresh" disabled={!selectedStore}>
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>

      {/* Store Selector */}
      <Card className="bg-gradient-to-t from-primary/5 to-card">
        <CardContent className="p-4">
          <Label className="text-sm font-medium text-foreground mb-2 block">Select Store</Label>
          <Select value={selectedStore} onValueChange={setSelectedStore}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select a store..." />
            </SelectTrigger>
            <SelectContent>
              {stores.map((store) => (
                <SelectItem key={store.name} value={store.name}>
                  {getStoreOptionText(store)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Stat Cards */}
      {!loading && selectedStore && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <Card className="bg-gradient-to-t from-primary/5 to-card shadow-sm">
            <CardHeader className="pb-2">
              <CardDescription>Total Documents</CardDescription>
              <CardTitle className="text-2xl font-semibold tabular-nums">{documents.length}</CardTitle>
            </CardHeader>
            <CardFooter className="text-sm text-muted-foreground">
              <FileText className="h-3.5 w-3.5 mr-1.5 text-foreground" />
              In current store
            </CardFooter>
          </Card>
          <Card className="bg-gradient-to-t from-primary/5 to-card shadow-sm">
            <CardHeader className="pb-2">
              <CardDescription>Active Docs</CardDescription>
              <CardTitle className="text-2xl font-semibold tabular-nums">
                {documents.filter(d => d.state === 'STATE_ACTIVE').length}
              </CardTitle>
            </CardHeader>
            <CardFooter className="text-sm text-muted-foreground">
              <FileText className="h-3.5 w-3.5 mr-1.5 text-foreground" />
              Ready to use
            </CardFooter>
          </Card>
          <Card className="bg-gradient-to-t from-primary/5 to-card shadow-sm">
            <CardHeader className="pb-2">
              <CardDescription>Total Size</CardDescription>
              <CardTitle className="text-lg font-semibold tabular-nums">
                {documents.reduce((sum, doc) => sum + (parseInt(doc.sizeBytes) || 0), 0) > 0
                  ? `${(documents.reduce((sum, doc) => sum + (parseInt(doc.sizeBytes) || 0), 0) / 1024).toFixed(1)} KB`
                  : '-'}
              </CardTitle>
            </CardHeader>
            <CardFooter className="text-sm text-muted-foreground">
              <FileText className="h-3.5 w-3.5 mr-1.5 text-foreground" />
              Storage used
            </CardFooter>
          </Card>
        </div>
      )}

      <Separator />

      {/* Upload Section */}
      <Card className="bg-gradient-to-t from-primary/5 to-card border-border/60">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Upload className="h-5 w-5 text-foreground" />
            Upload Document
          </CardTitle>
          <CardDescription>Upload a file or paste text content to the selected store</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Input
            value={uploadDisplayName}
            onChange={(e) => setUploadDisplayName(e.target.value)}
            placeholder="Document name (optional)"
            disabled={!selectedStore}
          />

          {/* File Upload */}
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              className="flex-1"
              disabled={!selectedStore}
              onClick={() => document.getElementById('gemini-file-input')?.click()}
            >
              <File className="h-4 w-4 mr-2" />
              {uploadFile ? uploadFile.name : 'Choose File...'}
            </Button>
            {uploadFile && (
              <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" onClick={() => setUploadFile(null)}>
                <X className="h-4 w-4" />
              </Button>
            )}
            <input
              id="gemini-file-input"
              type="file"
              className="hidden"
              accept=".txt,.md,.pdf,.html,.csv,.json,.xml,.doc,.docx"
              onChange={handleFileSelect}
            />
          </div>
          {uploadFile && (
            <p className="text-xs text-muted-foreground">File: {uploadFile.name} ({uploadFile.mimeType})</p>
          )}

          {/* Text Content (alternative to file) */}
          {!uploadFile && (
            <Textarea
              className="min-h-[120px] font-mono text-sm"
              value={uploadContent}
              onChange={(e) => setUploadContent(e.target.value)}
              placeholder="Or paste your text content here..."
              disabled={!selectedStore}
            />
          )}

          {/* Custom Metadata Section */}
          <Collapsible open={metadataOpen} onOpenChange={setMetadataOpen}>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="sm" className="w-full justify-between text-muted-foreground hover:text-foreground">
                <span className="flex items-center gap-2">
                  <Settings className="h-4 w-4" />
                  Custom Metadata {metadataRows.length > 0 && `(${metadataRows.filter(r => r.key.trim()).length})`}
                </span>
                <ChevronDown className={`h-4 w-4 transition-transform ${metadataOpen ? 'rotate-180' : ''}`} />
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="pt-2 space-y-2">
              {metadataRows.map((row, i) => (
                <div key={i} className="flex items-center gap-2">
                  <Input
                    className="flex-1"
                    placeholder="Key"
                    value={row.key}
                    onChange={(e) => updateMetadataRow(i, 'key', e.target.value)}
                  />
                  <Select value={row.type} onValueChange={(v) => updateMetadataRow(i, 'type', v)}>
                    <SelectTrigger className="w-[130px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="string">String</SelectItem>
                      <SelectItem value="number">Number</SelectItem>
                      <SelectItem value="stringList">String List</SelectItem>
                    </SelectContent>
                  </Select>
                  <Input
                    className="flex-1"
                    placeholder={row.type === 'number' ? '0' : row.type === 'stringList' ? 'a, b, c' : 'Value'}
                    type={row.type === 'number' ? 'number' : 'text'}
                    value={row.value}
                    onChange={(e) => updateMetadataRow(i, 'value', e.target.value)}
                  />
                  <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0 hover:text-red-400" onClick={() => removeMetadataRow(i)}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              {metadataRows.length < MAX_METADATA_ROWS && (
                <Button variant="outline" size="sm" className="w-full" onClick={addMetadataRow}>
                  <Plus className="h-4 w-4 mr-1" />
                  Add Metadata Field
                </Button>
              )}
              {metadataRows.length >= MAX_METADATA_ROWS && (
                <p className="text-xs text-muted-foreground text-center">Maximum {MAX_METADATA_ROWS} metadata fields</p>
              )}
            </CollapsibleContent>
          </Collapsible>

          <Button
            className="w-full"
            onClick={handleUpload}
            disabled={uploading || (!uploadFile && !uploadContent.trim()) || !selectedStore}
          >
            {uploading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Upload className="h-4 w-4 mr-2" />}
            Upload to Store
          </Button>
        </CardContent>
      </Card>

      {/* RAG Query Section */}
      <Card className="bg-gradient-to-t from-purple-500/5 to-card border-purple-500/20">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Search className="h-5 w-5 text-purple-500" />
            RAG Query
          </CardTitle>
          <CardDescription>Ask questions about documents in the selected store</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex gap-2">
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) handleQuery(); }}
              placeholder="Ask a question about your documents..."
              className="flex-1"
              disabled={!selectedStore}
            />
            <Button
              variant="outline"
              onClick={handleQuery}
              disabled={querying || !query.trim() || !selectedStore}
            >
              {querying ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Search className="h-4 w-4 mr-2" />}
              Ask
            </Button>
          </div>

          {queryResult && (
            <div className="mt-4 p-4 bg-muted/50 rounded-md border border-border">
              <p className="text-sm font-medium text-foreground mb-2">Response:</p>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                {typeof queryResult === 'string' ? queryResult : queryResult.answer || JSON.stringify(queryResult, null, 2)}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Documents Table */}
      {loading ? (
        <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
      ) : (
        <div className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground">Documents in Store</h2>
          {documents.length > 0 ? (
            <>
              <div className="rounded-md border border-border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Size</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {documents.map((doc) => (
                      <TableRow key={doc.name}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <FileText className="h-4 w-4 text-foreground shrink-0" />
                            <div className="min-w-0">
                              <p className="font-medium truncate">{doc.displayName}</p>
                              <p className="text-xs text-muted-foreground font-mono truncate max-w-[300px]">{doc.name}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={doc.state === 'STATE_ACTIVE' ? 'default' : 'secondary'} className="text-xs">
                            {doc.state?.replace('STATE_', '')}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">{doc.mimeType || '-'}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {doc.sizeBytes ? `${(parseInt(doc.sizeBytes) / 1024).toFixed(1)} KB` : '-'}
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
                              <DropdownMenuItem onClick={() => navigator.clipboard.writeText(doc.name)}>
                                Copy ID
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem className="text-red-400 focus:text-red-400" onClick={() => setDeleteTarget(doc)}>
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Load More */}
              {nextPageToken && (
                <div className="flex justify-center pt-2">
                  <Button variant="outline" onClick={handleLoadMore} disabled={loadingMore}>
                    {loadingMore ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <ChevronDown className="h-4 w-4 mr-2" />}
                    Load More
                  </Button>
                </div>
              )}
            </>
          ) : selectedStore ? (
            <div className="text-center py-8 text-muted-foreground">No documents found. Upload some content to get started!</div>
          ) : null}
        </div>
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete Document"
        message={`Delete document "${deleteTarget?.displayName}"? This action cannot be undone.`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
