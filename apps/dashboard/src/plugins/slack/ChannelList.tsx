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
  slackGetThreadReplies,
  slackCreateChannel,
  slackArchiveChannel,
  slackSetChannelTopic,
  slackGetChannelMembers,
  slackInviteToChannel,
  slackKickFromChannel,
  slackJoinChannel,
  slackOpenConversation,
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
  UserPlus,
  UserMinus,
  LogIn,
  MessageCircle,
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

  // Thread Replies
  const [threadTarget, setThreadTarget] = useState<SlackChannel | null>(null);
  const [threadTs, setThreadTs] = useState('');
  const [threadResult, setThreadResult] = useState<any>(null);
  const [loadingThread, setLoadingThread] = useState(false);

  // Invite User
  const [inviteTarget, setInviteTarget] = useState<SlackChannel | null>(null);
  const [inviteUsers, setInviteUsers] = useState('');
  const [inviting, setInviting] = useState(false);

  // Kick User
  const [kickTarget, setKickTarget] = useState<SlackChannel | null>(null);
  const [kickUser, setKickUser] = useState('');
  const [kicking, setKicking] = useState(false);

  // Open Conversation
  const [openConvoUsers, setOpenConvoUsers] = useState('');
  const [openConvoResult, setOpenConvoResult] = useState<any>(null);
  const [openingConvo, setOpeningConvo] = useState(false);

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

  const handleGetThreadReplies = async () => {
    if (!threadTarget || !threadTs.trim()) return;
    setLoadingThread(true);
    setThreadResult(null);
    try {
      const res = await slackGetThreadReplies(connectionId, threadTarget.id, threadTs.trim());
      setThreadResult(res.data ?? res.error);
    } catch (e) { toast.error(String(e)); } finally { setLoadingThread(false); }
  };

  const handleInvite = async () => {
    if (!inviteTarget || !inviteUsers.trim()) return;
    setInviting(true);
    try {
      const res = await slackInviteToChannel(connectionId, inviteTarget.id, inviteUsers.trim());
      if (res.error) {
        toast.error(String(res.error));
      } else {
        toast.success(`User(s) invited to #${inviteTarget.name}`);
        setInviteTarget(null);
        setInviteUsers('');
      }
    } finally { setInviting(false); }
  };

  const handleKick = async () => {
    if (!kickTarget || !kickUser.trim()) return;
    setKicking(true);
    try {
      const res = await slackKickFromChannel(connectionId, kickTarget.id, kickUser.trim());
      if (res.error) {
        toast.error(String(res.error));
      } else {
        toast.success(`User removed from #${kickTarget.name}`);
        setKickTarget(null);
        setKickUser('');
      }
    } finally { setKicking(false); }
  };

  const handleJoinChannel = async (ch: SlackChannel) => {
    try {
      const res = await slackJoinChannel(connectionId, ch.id);
      if (res.error) {
        toast.error(String(res.error));
      } else {
        toast.success(`Joined #${ch.name}`);
      }
    } catch (e) { toast.error(String(e)); }
  };

  const handleOpenConversation = async () => {
    if (!openConvoUsers.trim()) return;
    setOpeningConvo(true);
    try {
      const res = await slackOpenConversation(connectionId, openConvoUsers.trim());
      setOpenConvoResult(res.data ?? res.error);
      if (!res.error) toast.success('Conversation opened');
    } catch (e) { toast.error(String(e)); } finally { setOpeningConvo(false); }
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
                    <Button variant="outline" size="sm" onClick={(e) => { e.stopPropagation(); setThreadTarget(ch); setThreadTs(''); setThreadResult(null); }}>
                      <MessageCircle className="mr-1 h-3 w-3" /> Thread
                    </Button>
                    <Button variant="outline" size="sm" onClick={(e) => { e.stopPropagation(); setInviteTarget(ch); setInviteUsers(''); }}>
                      <UserPlus className="mr-1 h-3 w-3" /> Invite
                    </Button>
                    <Button variant="outline" size="sm" onClick={(e) => { e.stopPropagation(); setKickTarget(ch); setKickUser(''); }}>
                      <UserMinus className="mr-1 h-3 w-3" /> Kick
                    </Button>
                    <Button variant="outline" size="sm" onClick={(e) => { e.stopPropagation(); handleJoinChannel(ch); }}>
                      <LogIn className="mr-1 h-3 w-3" /> Join
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

      {/* Thread Replies Dialog */}
      <Dialog open={!!threadTarget} onOpenChange={(open) => !open && setThreadTarget(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Thread Replies — #{threadTarget?.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <Field>
              <FieldLabel>Parent Message Timestamp</FieldLabel>
              <FieldDescription>The ts of the parent message to get replies for</FieldDescription>
              <Input placeholder="1234567890.123456" value={threadTs} onChange={(e) => setThreadTs(e.target.value)} />
            </Field>
            <Button onClick={handleGetThreadReplies} disabled={loadingThread || !threadTs.trim()}>
              {loadingThread ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <MessageCircle className="mr-2 h-4 w-4" />}
              Get Replies
            </Button>
            {threadResult && <div className="max-h-72 overflow-auto"><JsonViewer data={threadResult} /></div>}
          </div>
        </DialogContent>
      </Dialog>

      {/* Invite User Dialog */}
      <Dialog open={!!inviteTarget} onOpenChange={(open) => !open && setInviteTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Invite to #{inviteTarget?.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <Field>
              <FieldLabel>User ID(s)</FieldLabel>
              <FieldDescription>Comma-separated user IDs (e.g. U01234,U05678)</FieldDescription>
              <Input placeholder="U01234567" value={inviteUsers} onChange={(e) => setInviteUsers(e.target.value)} />
            </Field>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setInviteTarget(null)}>Cancel</Button>
              <Button onClick={handleInvite} disabled={inviting || !inviteUsers.trim()}>
                {inviting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Invite
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Kick User Dialog */}
      <Dialog open={!!kickTarget} onOpenChange={(open) => !open && setKickTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Remove from #{kickTarget?.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <Field>
              <FieldLabel>User ID</FieldLabel>
              <Input placeholder="U01234567" value={kickUser} onChange={(e) => setKickUser(e.target.value)} />
            </Field>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setKickTarget(null)}>Cancel</Button>
              <Button variant="destructive" onClick={handleKick} disabled={kicking || !kickUser.trim()}>
                {kicking && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Remove
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Separator />

      {/* Open Conversation */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2"><MessageSquare className="h-4 w-4" /> Open Conversation</CardTitle>
          <CardDescription>Open or create a direct message / group conversation</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <label className="text-sm font-medium">User ID(s)</label>
            <Input placeholder="U01234567,U89012345" value={openConvoUsers} onChange={(e) => setOpenConvoUsers(e.target.value)} className="mt-1" />
            <p className="text-xs text-muted-foreground mt-1">Comma-separated for group DMs</p>
          </div>
          <Button onClick={handleOpenConversation} disabled={openingConvo || !openConvoUsers.trim()}>
            {openingConvo ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <MessageSquare className="mr-2 h-4 w-4" />}
            Open
          </Button>
          {openConvoResult && <JsonViewer data={openConvoResult} />}
        </CardContent>
      </Card>
    </div>
  );
}
