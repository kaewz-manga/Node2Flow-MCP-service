/**
 * Slack Plugin - File Manager Page
 * Upload, list, search, and delete files + pins management
 */

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import {
  usePluginConnection,
  Button,
  Input,
  Textarea,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  Separator,
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from '@node2flow/dashboard-core';
import JsonViewer from '../n8n/components/JsonViewer';
import {
  slackListFiles,
  slackUploadFile,
  slackDeleteFile,
  slackSearchFiles,
  slackListPins,
} from '../../lib/gateway-api';
import {
  Upload,
  FileText,
  Trash2,
  Search,
  Pin,
  Loader2,
  AlertCircle,
  RefreshCw,
  File as FileIcon,
} from 'lucide-react';

interface SlackFile {
  id: string;
  name: string;
  title?: string;
  mimetype?: string;
  size?: number;
  created?: number;
  user?: string;
  url_private?: string;
  filetype?: string;
}

export default function SlackFileManager() {
  const activeConnection = usePluginConnection('slack');
  const connectionId = activeConnection?.id;

  // Files list
  const [files, setFiles] = useState<SlackFile[]>([]);
  const [loading, setLoading] = useState(false);

  // Upload
  const [uploadContent, setUploadContent] = useState('');
  const [uploadFilename, setUploadFilename] = useState('');
  const [uploadChannel, setUploadChannel] = useState('');
  const [uploadComment, setUploadComment] = useState('');
  const [uploading, setUploading] = useState(false);

  // Delete
  const [deleteTarget, setDeleteTarget] = useState<SlackFile | null>(null);

  // Search
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResult, setSearchResult] = useState<any>(null);
  const [searching, setSearching] = useState(false);

  // Pins
  const [pinsChannel, setPinsChannel] = useState('');
  const [pinsResult, setPinsResult] = useState<any>(null);
  const [loadingPins, setLoadingPins] = useState(false);

  const fetchFiles = useCallback(async () => {
    if (!connectionId) return;
    setLoading(true);
    try {
      const res = await slackListFiles(connectionId, { count: 50 });
      const data = res.data as any;
      if (data?.files) {
        setFiles(data.files);
      } else if (Array.isArray(data)) {
        setFiles(data);
      } else {
        setFiles([]);
      }
    } catch (e) {
      toast.error(String(e));
    } finally {
      setLoading(false);
    }
  }, [connectionId]);

  useEffect(() => {
    fetchFiles();
  }, [fetchFiles]);

  if (!connectionId) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">No connection selected</h3>
        <p className="text-muted-foreground">Select a Slack connection from the Connections page first.</p>
      </div>
    );
  }

  const handleUpload = async () => {
    if (!uploadContent.trim() || !uploadFilename.trim()) return;
    setUploading(true);
    try {
      const opts: Record<string, unknown> = {};
      if (uploadChannel.trim()) opts.channel_id = uploadChannel.trim();
      if (uploadComment.trim()) opts.initial_comment = uploadComment.trim();
      const res = await slackUploadFile(connectionId, uploadContent, uploadFilename.trim(), opts);
      if (res.error) {
        toast.error(String(res.error));
      } else {
        toast.success(`File "${uploadFilename}" uploaded`);
        setUploadContent('');
        setUploadFilename('');
        setUploadChannel('');
        setUploadComment('');
        fetchFiles();
      }
    } finally {
      setUploading(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      const res = await slackDeleteFile(connectionId, deleteTarget.id);
      if (res.error) {
        toast.error(String(res.error));
      } else {
        toast.success(`File "${deleteTarget.name}" deleted`);
        fetchFiles();
      }
    } catch (e) {
      toast.error(String(e));
    }
    setDeleteTarget(null);
  };

  const handleSearchFiles = async () => {
    if (!searchQuery.trim()) return;
    setSearching(true);
    try {
      const res = await slackSearchFiles(connectionId, searchQuery.trim());
      setSearchResult(res.data ?? res.error);
    } catch (e) {
      toast.error(String(e));
    } finally {
      setSearching(false);
    }
  };

  const handleGetPins = async () => {
    if (!pinsChannel.trim()) return;
    setLoadingPins(true);
    setPinsResult(null);
    try {
      const res = await slackListPins(connectionId, pinsChannel.trim());
      setPinsResult(res.data ?? res.error);
    } catch (e) {
      toast.error(String(e));
    } finally {
      setLoadingPins(false);
    }
  };

  const formatSize = (bytes?: number) => {
    if (!bytes) return '\u2014';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Files & Pins</h2>
          <p className="text-sm text-muted-foreground">Manage workspace files and pinned items</p>
        </div>
        <Button variant="outline" size="icon" onClick={fetchFiles} disabled={loading}>
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
        </Button>
      </div>

      {/* Upload File */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Upload className="h-4 w-4" /> Upload File
          </CardTitle>
          <CardDescription>Upload text content as a file to Slack</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium">Filename</label>
              <Input
                placeholder="report.txt"
                value={uploadFilename}
                onChange={(e) => setUploadFilename(e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Channel ID (optional)</label>
              <Input
                placeholder="C01234567"
                value={uploadChannel}
                onChange={(e) => setUploadChannel(e.target.value)}
                className="mt-1"
              />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium">File Content</label>
            <Textarea
              placeholder="Paste file content here..."
              value={uploadContent}
              onChange={(e) => setUploadContent(e.target.value)}
              className="mt-1"
              rows={4}
            />
          </div>
          <div>
            <label className="text-sm font-medium">Comment (optional)</label>
            <Input
              placeholder="Here's the report..."
              value={uploadComment}
              onChange={(e) => setUploadComment(e.target.value)}
              className="mt-1"
            />
          </div>
          <Button onClick={handleUpload} disabled={uploading || !uploadContent.trim() || !uploadFilename.trim()}>
            {uploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
            Upload
          </Button>
        </CardContent>
      </Card>

      <Separator />

      {/* File List */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <FileText className="h-4 w-4" /> Files ({files.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading && files.length === 0 ? (
            <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin" /></div>
          ) : files.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">No files found</p>
          ) : (
            <div className="space-y-2">
              {files.map((file) => (
                <div key={file.id} className="flex items-center justify-between rounded bg-muted/50 px-3 py-2">
                  <div className="flex items-center gap-3 min-w-0">
                    <FileIcon className="h-4 w-4 shrink-0 text-muted-foreground" />
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{file.name || file.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {file.filetype?.toUpperCase()} · {formatSize(file.size)}
                        {file.created && ` · ${new Date(file.created * 1000).toLocaleDateString()}`}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-red-500 hover:text-red-600 shrink-0"
                    onClick={() => setDeleteTarget(file)}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Separator />

      {/* Search Files */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Search className="h-4 w-4" /> Search Files
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex gap-2">
            <Input
              placeholder="Search files..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearchFiles()}
            />
            <Button onClick={handleSearchFiles} disabled={searching || !searchQuery.trim()}>
              {searching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
            </Button>
          </div>
          {searchResult && <JsonViewer data={searchResult} />}
        </CardContent>
      </Card>

      <Separator />

      {/* Pins */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Pin className="h-4 w-4" /> Pinned Items
          </CardTitle>
          <CardDescription>View pinned items in a channel</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex gap-2">
            <Input
              placeholder="Channel ID (C01234567)"
              value={pinsChannel}
              onChange={(e) => setPinsChannel(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleGetPins()}
            />
            <Button onClick={handleGetPins} disabled={loadingPins || !pinsChannel.trim()}>
              {loadingPins ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Get Pins'}
            </Button>
          </div>
          {pinsResult && <JsonViewer data={pinsResult} />}
        </CardContent>
      </Card>

      {/* Delete Confirm */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete File</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{deleteTarget?.name}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction className="bg-red-600 hover:bg-red-700" onClick={confirmDelete}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
