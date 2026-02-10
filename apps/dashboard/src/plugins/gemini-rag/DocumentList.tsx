import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { listStores, listDocuments, deleteDocument, uploadToStore, ragQuery } from '../../lib/gateway-api';
import { usePluginConnection, Button, Input, Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter, Alert, AlertDescription, Separator, Badge } from '@node2flow/dashboard-core';

import ConfirmDialog from '../n8n/components/ConfirmDialog';
import { Loader2, Plus, RefreshCw, AlertCircle, FileText, Upload, Search, Trash2, ChevronDown, Database } from 'lucide-react';

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

  // Upload
  const [uploadDisplayName, setUploadDisplayName] = useState('');
  const [uploadContent, setUploadContent] = useState('');
  const [uploading, setUploading] = useState(false);

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
    const res = await listDocuments(connectionId, selectedStore);
    if (res.success && res.data) {
      const d = res.data as any;
      setDocuments(Array.isArray(d) ? d : d.documents || []);
    } else {
      setError(res.error?.message || 'Failed to load documents');
    }
    setLoading(false);
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

  async function handleUpload() {
    if (!uploadContent.trim() || !connectionId || !selectedStore) return;
    setUploading(true);
    const res = await uploadToStore(connectionId, selectedStore, {
      mimeType: 'text/plain',
      content: uploadContent,
      displayName: uploadDisplayName.trim() || 'Untitled Document'
    });
    if (res.success) {
      toast.success('Document uploaded successfully');
      setUploadDisplayName('');
      setUploadContent('');
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
          <label className="text-sm font-medium text-foreground mb-2 block">Select Store</label>
          <select
            className="w-full px-3 py-2 bg-background border border-border rounded-md text-foreground"
            value={selectedStore}
            onChange={(e) => setSelectedStore(e.target.value)}
          >
            {stores.map((store) => (
              <option key={store.name} value={store.name}>
                {store.displayName} ({store.documentCount || 0} docs)
              </option>
            ))}
          </select>
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
              <FileText className="h-3.5 w-3.5 mr-1.5 text-primary" />
              In current store
            </CardFooter>
          </Card>
          <Card className="bg-gradient-to-t from-emerald-500/5 to-card shadow-sm">
            <CardHeader className="pb-2">
              <CardDescription>Active Docs</CardDescription>
              <CardTitle className="text-2xl font-semibold tabular-nums">
                {documents.filter(d => d.state === 'STATE_ACTIVE').length}
              </CardTitle>
            </CardHeader>
            <CardFooter className="text-sm text-muted-foreground">
              <FileText className="h-3.5 w-3.5 mr-1.5 text-emerald-500" />
              Ready to use
            </CardFooter>
          </Card>
          <Card className="bg-gradient-to-t from-amber-500/5 to-card shadow-sm">
            <CardHeader className="pb-2">
              <CardDescription>Total Size</CardDescription>
              <CardTitle className="text-lg font-semibold tabular-nums">
                {documents.reduce((sum, doc) => sum + (parseInt(doc.sizeBytes) || 0), 0) > 0
                  ? `${(documents.reduce((sum, doc) => sum + (parseInt(doc.sizeBytes) || 0), 0) / 1024).toFixed(1)} KB`
                  : '-'}
              </CardTitle>
            </CardHeader>
            <CardFooter className="text-sm text-muted-foreground">
              <FileText className="h-3.5 w-3.5 mr-1.5 text-amber-500" />
              Storage used
            </CardFooter>
          </Card>
        </div>
      )}

      <Separator />

      {/* Upload Section */}
      <Card className="bg-gradient-to-t from-emerald-500/5 to-card border-emerald-500/20">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Upload className="h-5 w-5 text-emerald-500" />
            Upload Document
          </CardTitle>
          <CardDescription>Upload text content to the selected store</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Input
            value={uploadDisplayName}
            onChange={(e) => setUploadDisplayName(e.target.value)}
            placeholder="Document name (optional)"
            disabled={!selectedStore}
          />
          <textarea
            className="w-full px-3 py-2 bg-background border border-border rounded-md text-foreground min-h-[120px] font-mono text-sm"
            value={uploadContent}
            onChange={(e) => setUploadContent(e.target.value)}
            placeholder="Paste your text content here..."
            disabled={!selectedStore}
          />
          <Button
            className="bg-emerald-600 hover:bg-emerald-700 text-white w-full"
            onClick={handleUpload}
            disabled={uploading || !uploadContent.trim() || !selectedStore}
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

      {/* Documents List */}
      {loading ? (
        <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
      ) : (
        <div className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground">Documents in Store</h2>
          {documents.map((doc) => (
            <Card key={doc.name} className="hover:shadow-md transition-all">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <FileText className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-foreground">{doc.displayName}</h3>
                      <Badge variant={doc.state === 'STATE_ACTIVE' ? 'default' : 'secondary'} className="text-xs">
                        {doc.state?.replace('STATE_', '')}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground font-mono truncate mb-1">{doc.name}</p>
                    <div className="flex gap-3 text-xs text-muted-foreground">
                      {doc.mimeType && <span>Type: {doc.mimeType}</span>}
                      {doc.sizeBytes && <span>Size: {(parseInt(doc.sizeBytes) / 1024).toFixed(1)} KB</span>}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 hover:text-red-400 hover:bg-red-900/30"
                    onClick={() => setDeleteTarget(doc)}
                    title="Delete document"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
          {documents.length === 0 && selectedStore && (
            <div className="text-center py-8 text-muted-foreground">No documents found. Upload some content to get started!</div>
          )}
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
