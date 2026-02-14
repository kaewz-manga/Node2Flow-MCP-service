/**
 * Slack Plugin - Channel List Page
 * List, create, and manage Slack channels
 */

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import {
  usePluginConnection,
  Button,
  Input,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  Separator,
  Switch,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
  Field,
  FieldLabel,
  FieldDescription,
} from '@node2flow/dashboard-core';
import JsonViewer from '../n8n/components/JsonViewer';
import {
  slackListChannels,
  slackGetChannelInfo,
  slackGetChannelHistory,
  slackCreateChannel,
  slackArchiveChannel,
  slackSetChannelTopic,
  slackGetChannelMembers,
} from '../../lib/gateway-api';
import {
  Hash,
  Lock,
  Plus,
  Archive,
  Users,
  MessageSquare,
  ChevronDown,
  ChevronRight,
  Loader2,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';

interface SlackChannel {
  id: string;
  name: string;
  is_private?: boolean;
  is_archived?: boolean;
  topic?: { value: string };
  purpose?: { value: string };
  num_members?: number;
}

export default function SlackChannelList() {
  const activeConnection = usePluginConnection('slack');
  const connectionId = activeConnection?.id;

  const [channels, setChannels] = useState<SlackChannel[]>([]);
  const [loading, setLoading] = useState(false);
  const [expandedChannel, setExpandedChannel] = useState<string | null>(null);
  const [channelDetail, setChannelDetail] = useState<any>(null);

  // Create
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState('');
  const [newPrivate, setNewPrivate] = useState(false);
  const [creating, setCreating] = useState(false);

  // Archive
  const [archiveTarget, setArchiveTarget] = useState<SlackChannel | null>(null);

  // Topic
  const [topicTarget, setTopicTarget] = useState<SlackChannel | null>(null);
  const [topicValue, setTopicValue] = useState('');
  const [settingTopic, setSettingTopic] = useState(false);

  // History
  const [historyTarget, setHistoryTarget] = useState<SlackChannel | null>(null);
  const [historyResult, setHistoryResult] = useState<any>(null);
  const [loadingHistory, setLoadingHistory] = useState(false);

  // Members
  const [membersTarget, setMembersTarget] = useState<SlackChannel | null>(null);
  const [membersResult, setMembersResult] = useState<any>(null);
  const [loadingMembers, setLoadingMembers] = useState(false);

  const fetchChannels = useCallback(async () => {
    if (!connectionId) return;
    setLoading(true);
    try {
      const res = await slackListChannels(connectionId, { limit: 200 });
      const data = res.data as any;
      if (data?.channels) {
        setChannels(data.channels);
      } else if (Array.isArray(data)) {
        setChannels(data);
      } else {
        setChannels([]);
      }
    } catch (e) {
      toast.error(String(e));
    } finally {
      setLoading(false);
    }
  }, [connectionId]);

  useEffect(() => {
    fetchChannels();
  }, [fetchChannels]);

  if (!connectionId) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">No connection selected</h3>
        <p className="text-muted-foreground">Select a Slack connection from the Connections page first.</p>
      </div>
    );
  }

  const handleCreate = async () => {
    if (!newName.trim()) return;
    setCreating(true);
    try {
      const res = await slackCreateChannel(connectionId, newName.trim().toLowerCase().replace(/\s+/g, '-'), newPrivate);
      if (res.error) {
        toast.error(String(res.error));
      } else {
        toast.success(`Channel #${newName.trim()} created`);
        setShowCreate(false);
        setNewName('');
        setNewPrivate(false);
        fetchChannels();
      }
    } finally {
      setCreating(false);
    }
  };

  const confirmArchive = async () => {
    if (!archiveTarget) return;
    try {
      const res = await slackArchiveChannel(connectionId, archiveTarget.id);
      if (res.error) {
        toast.error(String(res.error));
      } else {
        toast.success(`#${archiveTarget.name} archived`);
        fetchChannels();
      }
    } catch (e) {
      toast.error(String(e));
    }
    setArchiveTarget(null);
  };

  const handleSetTopic = async () => {
    if (!topicTarget) return;
    setSettingTopic(true);
    try {
      const res = await slackSetChannelTopic(connectionId, topicTarget.id, topicValue);
      if (res.error) {
        toast.error(String(res.error));
      } else {
        toast.success('Channel topic updated');
        setTopicTarget(null);
        fetchChannels();
      }
    } finally {
      setSettingTopic(false);
    }
  };

  const handleGetHistory = async (ch: SlackChannel) => {
    setHistoryTarget(ch);
    setLoadingHistory(true);
    setHistoryResult(null);
    try {
      const res = await slackGetChannelHistory(connectionId, ch.id, { limit: 20 });
      setHistoryResult(res.data ?? res.error);
    } catch (e) {
      setHistoryResult(String(e));
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleGetMembers = async (ch: SlackChannel) => {
    setMembersTarget(ch);
    setLoadingMembers(true);
    setMembersResult(null);
    try {
      const res = await slackGetChannelMembers(connectionId, ch.id);
      setMembersResult(res.data ?? res.error);
    } catch (e) {
      setMembersResult(String(e));
    } finally {
      setLoadingMembers(false);
    }
  };

  const handleToggleExpand = async (ch: SlackChannel) => {
    if (expandedChannel === ch.id) {
      setExpandedChannel(null);
      return;
    }
    setExpandedChannel(ch.id);
    try {
      const res = await slackGetChannelInfo(connectionId, ch.id);
      setChannelDetail(res.data);
    } catch {
      setChannelDetail(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Channels</h2>
          <p className="text-sm text-muted-foreground">{channels.length} channels found</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="icon" onClick={fetchChannels} disabled={loading}>
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
          <Button onClick={() => setShowCreate(true)}>
            <Plus className="mr-2 h-4 w-4" /> Create Channel
          </Button>
        </div>
      </div>

      {loading && channels.length === 0 ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : channels.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Hash className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No channels found</h3>
            <p className="text-muted-foreground">Create a channel or check bot permissions.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {channels.map((ch) => (
            <Card key={ch.id} className={ch.is_archived ? 'opacity-60' : ''}>
              <CardHeader className="pb-2 cursor-pointer" onClick={() => handleToggleExpand(ch)}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {expandedChannel === ch.id ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                    {ch.is_private ? <Lock className="h-4 w-4 text-amber-500" /> : <Hash className="h-4 w-4" />}
                    <CardTitle className="text-base">{ch.name}</CardTitle>
                    {ch.is_archived && <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded">Archived</span>}
                  </div>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    {ch.num_members != null && (
                      <span className="flex items-center gap-1"><Users className="h-3 w-3" />{ch.num_members}</span>
                    )}
                  </div>
                </div>
                {ch.topic?.value && (
                  <CardDescription className="ml-10 truncate">{ch.topic.value}</CardDescription>
                )}
              </CardHeader>

              {expandedChannel === ch.id && (
                <CardContent className="pt-0">
                  <Separator className="mb-3" />
                  <div className="flex flex-wrap gap-2 mb-3">
                    <Button variant="outline" size="sm" onClick={(e) => { e.stopPropagation(); handleGetHistory(ch); }}>
                      <MessageSquare className="mr-1 h-3 w-3" /> History
                    </Button>
                    <Button variant="outline" size="sm" onClick={(e) => { e.stopPropagation(); handleGetMembers(ch); }}>
                      <Users className="mr-1 h-3 w-3" /> Members
                    </Button>
                    <Button variant="outline" size="sm" onClick={(e) => {
                      e.stopPropagation();
                      setTopicTarget(ch);
                      setTopicValue(ch.topic?.value || '');
                    }}>
                      Set Topic
                    </Button>
                    {!ch.is_archived && (
                      <Button variant="outline" size="sm" className="text-amber-500" onClick={(e) => { e.stopPropagation(); setArchiveTarget(ch); }}>
                        <Archive className="mr-1 h-3 w-3" /> Archive
                      </Button>
                    )}
                  </div>
                  {channelDetail && <JsonViewer data={channelDetail} />}
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      )}

      {/* Create Channel Dialog */}
      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Channel</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <Field>
              <FieldLabel>Channel Name</FieldLabel>
              <FieldDescription>Lowercase, no spaces. Hyphens and underscores ok.</FieldDescription>
              <Input
                placeholder="project-updates"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
              />
            </Field>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Private Channel</p>
                <p className="text-xs text-muted-foreground">Only invited members can access</p>
              </div>
              <Switch checked={newPrivate} onCheckedChange={setNewPrivate} />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowCreate(false)}>Cancel</Button>
              <Button onClick={handleCreate} disabled={creating || !newName.trim()}>
                {creating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Create
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Archive Confirm */}
      <AlertDialog open={!!archiveTarget} onOpenChange={(open) => !open && setArchiveTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Archive Channel</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to archive #{archiveTarget?.name}? Members won't be able to send messages.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmArchive}>Archive</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Set Topic Dialog */}
      <Dialog open={!!topicTarget} onOpenChange={(open) => !open && setTopicTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Set Channel Topic — #{topicTarget?.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <Field>
              <FieldLabel>Topic</FieldLabel>
              <Input
                value={topicValue}
                onChange={(e) => setTopicValue(e.target.value)}
                placeholder="What's this channel about?"
              />
            </Field>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setTopicTarget(null)}>Cancel</Button>
              <Button onClick={handleSetTopic} disabled={settingTopic}>
                {settingTopic && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* History Dialog */}
      <Dialog open={!!historyTarget} onOpenChange={(open) => !open && setHistoryTarget(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Channel History — #{historyTarget?.name}</DialogTitle>
          </DialogHeader>
          <div className="py-2 max-h-96 overflow-auto">
            {loadingHistory ? (
              <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin" /></div>
            ) : (
              historyResult && <JsonViewer data={historyResult} />
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Members Dialog */}
      <Dialog open={!!membersTarget} onOpenChange={(open) => !open && setMembersTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Members — #{membersTarget?.name}</DialogTitle>
          </DialogHeader>
          <div className="py-2 max-h-96 overflow-auto">
            {loadingMembers ? (
              <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin" /></div>
            ) : (
              membersResult && <JsonViewer data={membersResult} />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
