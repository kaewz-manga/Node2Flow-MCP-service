/**
 * Slack Plugin - Message Tools Page
 * Send, update, delete, schedule, search messages + permalink
 */

import { useState } from 'react';
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
} from '@node2flow/dashboard-core';
import JsonViewer from '../n8n/components/JsonViewer';
import {
  slackSendMessage,
  slackUpdateMessage,
  slackDeleteMessage,
  slackScheduleMessage,
  slackListScheduledMessages,
  slackDeleteScheduledMessage,
  slackSearchMessages,
  slackGetPermalink,
  slackGetTeamInfo,
} from '../../lib/gateway-api';
import { Send, Clock, Search, Loader2, AlertCircle, Bot, Pencil, Trash2, Link, List } from 'lucide-react';

export default function SlackMessageTools() {
  const activeConnection = usePluginConnection('slack');
  const connectionId = activeConnection?.id;

  // Team Info
  const [teamInfo, setTeamInfo] = useState<any>(null);
  const [loadingTeam, setLoadingTeam] = useState(false);

  // Send Message
  const [sendChannel, setSendChannel] = useState('');
  const [sendText, setSendText] = useState('');
  const [sendResult, setSendResult] = useState<any>(null);
  const [sending, setSending] = useState(false);

  // Update Message
  const [updateChannel, setUpdateChannel] = useState('');
  const [updateTs, setUpdateTs] = useState('');
  const [updateText, setUpdateText] = useState('');
  const [updateResult, setUpdateResult] = useState<any>(null);
  const [updating, setUpdating] = useState(false);

  // Delete Message
  const [deleteChannel, setDeleteChannel] = useState('');
  const [deleteTs, setDeleteTs] = useState('');
  const [deleteResult, setDeleteResult] = useState<any>(null);
  const [deleting, setDeleting] = useState(false);

  // Schedule Message
  const [schedChannel, setSchedChannel] = useState('');
  const [schedText, setSchedText] = useState('');
  const [schedTime, setSchedTime] = useState('');
  const [schedResult, setSchedResult] = useState<any>(null);
  const [scheduling, setScheduling] = useState(false);

  // List Scheduled
  const [scheduledList, setScheduledList] = useState<any>(null);
  const [loadingScheduled, setLoadingScheduled] = useState(false);

  // Delete Scheduled
  const [delSchedChannel, setDelSchedChannel] = useState('');
  const [delSchedId, setDelSchedId] = useState('');
  const [delSchedResult, setDelSchedResult] = useState<any>(null);
  const [deletingSched, setDeletingSched] = useState(false);

  // Get Permalink
  const [plinkChannel, setPlinkChannel] = useState('');
  const [plinkTs, setPlinkTs] = useState('');
  const [plinkResult, setPlinkResult] = useState<any>(null);
  const [loadingPlink, setLoadingPlink] = useState(false);

  // Search
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResult, setSearchResult] = useState<any>(null);
  const [searching, setSearching] = useState(false);

  if (!connectionId) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">No connection selected</h3>
        <p className="text-muted-foreground">Select a Slack connection from the Connections page first.</p>
      </div>
    );
  }

  const handleGetTeamInfo = async () => {
    setLoadingTeam(true);
    try {
      const res = await slackGetTeamInfo(connectionId);
      setTeamInfo(res.data ?? res.error);
    } catch (e) { toast.error(String(e)); } finally { setLoadingTeam(false); }
  };

  const handleSend = async () => {
    if (!sendChannel.trim() || !sendText.trim()) return;
    setSending(true);
    try {
      const res = await slackSendMessage(connectionId, sendChannel.trim(), sendText.trim());
      setSendResult(res.data ?? res.error);
      if (!res.error) toast.success('Message sent');
    } catch (e) { toast.error(String(e)); } finally { setSending(false); }
  };

  const handleUpdate = async () => {
    if (!updateChannel.trim() || !updateTs.trim() || !updateText.trim()) return;
    setUpdating(true);
    try {
      const res = await slackUpdateMessage(connectionId, updateChannel.trim(), updateTs.trim(), { text: updateText.trim() });
      setUpdateResult(res.data ?? res.error);
      if (!res.error) toast.success('Message updated');
    } catch (e) { toast.error(String(e)); } finally { setUpdating(false); }
  };

  const handleDelete = async () => {
    if (!deleteChannel.trim() || !deleteTs.trim()) return;
    setDeleting(true);
    try {
      const res = await slackDeleteMessage(connectionId, deleteChannel.trim(), deleteTs.trim());
      setDeleteResult(res.data ?? res.error);
      if (!res.error) toast.success('Message deleted');
    } catch (e) { toast.error(String(e)); } finally { setDeleting(false); }
  };

  const handleSchedule = async () => {
    if (!schedChannel.trim() || !schedText.trim() || !schedTime) return;
    setScheduling(true);
    try {
      const postAt = Math.floor(new Date(schedTime).getTime() / 1000);
      const res = await slackScheduleMessage(connectionId, schedChannel.trim(), postAt, schedText.trim());
      setSchedResult(res.data ?? res.error);
      if (!res.error) toast.success('Message scheduled');
    } catch (e) { toast.error(String(e)); } finally { setScheduling(false); }
  };

  const handleListScheduled = async () => {
    setLoadingScheduled(true);
    try {
      const res = await slackListScheduledMessages(connectionId);
      setScheduledList(res.data ?? res.error);
    } catch (e) { toast.error(String(e)); } finally { setLoadingScheduled(false); }
  };

  const handleDeleteScheduled = async () => {
    if (!delSchedChannel.trim() || !delSchedId.trim()) return;
    setDeletingSched(true);
    try {
      const res = await slackDeleteScheduledMessage(connectionId, delSchedChannel.trim(), delSchedId.trim());
      setDelSchedResult(res.data ?? res.error);
      if (!res.error) toast.success('Scheduled message deleted');
    } catch (e) { toast.error(String(e)); } finally { setDeletingSched(false); }
  };

  const handleGetPermalink = async () => {
    if (!plinkChannel.trim() || !plinkTs.trim()) return;
    setLoadingPlink(true);
    try {
      const res = await slackGetPermalink(connectionId, plinkChannel.trim(), plinkTs.trim());
      setPlinkResult(res.data ?? res.error);
    } catch (e) { toast.error(String(e)); } finally { setLoadingPlink(false); }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setSearching(true);
    try {
      const res = await slackSearchMessages(connectionId, searchQuery.trim());
      setSearchResult(res.data ?? res.error);
    } catch (e) { toast.error(String(e)); } finally { setSearching(false); }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Messages</h2>
        <p className="text-sm text-muted-foreground">Send, update, delete, schedule, and search messages</p>
      </div>

      {/* Team Info */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base flex items-center gap-2"><Bot className="h-4 w-4" /> Workspace Info</CardTitle>
              <CardDescription>Get information about the connected workspace</CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={handleGetTeamInfo} disabled={loadingTeam}>
              {loadingTeam ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Get Info'}
            </Button>
          </div>
        </CardHeader>
        {teamInfo && <CardContent><JsonViewer data={teamInfo} /></CardContent>}
      </Card>

      <Separator />

      {/* Send Message */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2"><Send className="h-4 w-4" /> Send Message</CardTitle>
          <CardDescription>Send a message to a channel or user</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <label className="text-sm font-medium">Channel ID</label>
            <Input placeholder="C01234567" value={sendChannel} onChange={(e) => setSendChannel(e.target.value)} className="mt-1" />
          </div>
          <div>
            <label className="text-sm font-medium">Message</label>
            <Textarea placeholder="Hello from Node2Flow!" value={sendText} onChange={(e) => setSendText(e.target.value)} className="mt-1" rows={3} />
          </div>
          <Button onClick={handleSend} disabled={sending || !sendChannel.trim() || !sendText.trim()}>
            {sending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
            Send
          </Button>
          {sendResult && <JsonViewer data={sendResult} />}
        </CardContent>
      </Card>

      {/* Update Message */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2"><Pencil className="h-4 w-4" /> Update Message</CardTitle>
          <CardDescription>Edit an existing message by its timestamp</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium">Channel ID</label>
              <Input placeholder="C01234567" value={updateChannel} onChange={(e) => setUpdateChannel(e.target.value)} className="mt-1" />
            </div>
            <div>
              <label className="text-sm font-medium">Message Timestamp</label>
              <Input placeholder="1234567890.123456" value={updateTs} onChange={(e) => setUpdateTs(e.target.value)} className="mt-1" />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium">New Text</label>
            <Textarea placeholder="Updated message content..." value={updateText} onChange={(e) => setUpdateText(e.target.value)} className="mt-1" rows={3} />
          </div>
          <Button onClick={handleUpdate} disabled={updating || !updateChannel.trim() || !updateTs.trim() || !updateText.trim()}>
            {updating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Pencil className="mr-2 h-4 w-4" />}
            Update
          </Button>
          {updateResult && <JsonViewer data={updateResult} />}
        </CardContent>
      </Card>

      {/* Delete Message */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2"><Trash2 className="h-4 w-4" /> Delete Message</CardTitle>
          <CardDescription>Delete a message by its timestamp</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium">Channel ID</label>
              <Input placeholder="C01234567" value={deleteChannel} onChange={(e) => setDeleteChannel(e.target.value)} className="mt-1" />
            </div>
            <div>
              <label className="text-sm font-medium">Message Timestamp</label>
              <Input placeholder="1234567890.123456" value={deleteTs} onChange={(e) => setDeleteTs(e.target.value)} className="mt-1" />
            </div>
          </div>
          <Button variant="destructive" onClick={handleDelete} disabled={deleting || !deleteChannel.trim() || !deleteTs.trim()}>
            {deleting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Trash2 className="mr-2 h-4 w-4" />}
            Delete
          </Button>
          {deleteResult && <JsonViewer data={deleteResult} />}
        </CardContent>
      </Card>

      <Separator />

      {/* Schedule Message */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2"><Clock className="h-4 w-4" /> Schedule Message</CardTitle>
          <CardDescription>Schedule a message for a future time</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <label className="text-sm font-medium">Channel ID</label>
            <Input placeholder="C01234567" value={schedChannel} onChange={(e) => setSchedChannel(e.target.value)} className="mt-1" />
          </div>
          <div>
            <label className="text-sm font-medium">Message</label>
            <Textarea placeholder="Scheduled message..." value={schedText} onChange={(e) => setSchedText(e.target.value)} className="mt-1" rows={3} />
          </div>
          <div>
            <label className="text-sm font-medium">Send At</label>
            <Input type="datetime-local" value={schedTime} onChange={(e) => setSchedTime(e.target.value)} className="mt-1" />
          </div>
          <Button onClick={handleSchedule} disabled={scheduling || !schedChannel.trim() || !schedText.trim() || !schedTime}>
            {scheduling ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Clock className="mr-2 h-4 w-4" />}
            Schedule
          </Button>
          {schedResult && <JsonViewer data={schedResult} />}
        </CardContent>
      </Card>

      {/* List Scheduled Messages */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base flex items-center gap-2"><List className="h-4 w-4" /> Scheduled Messages</CardTitle>
              <CardDescription>View pending scheduled messages</CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={handleListScheduled} disabled={loadingScheduled}>
              {loadingScheduled ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Load'}
            </Button>
          </div>
        </CardHeader>
        {scheduledList && <CardContent><JsonViewer data={scheduledList} /></CardContent>}
      </Card>

      {/* Delete Scheduled Message */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2"><Trash2 className="h-4 w-4" /> Cancel Scheduled Message</CardTitle>
          <CardDescription>Delete a pending scheduled message</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium">Channel ID</label>
              <Input placeholder="C01234567" value={delSchedChannel} onChange={(e) => setDelSchedChannel(e.target.value)} className="mt-1" />
            </div>
            <div>
              <label className="text-sm font-medium">Scheduled Message ID</label>
              <Input placeholder="Q1234ABCD5678" value={delSchedId} onChange={(e) => setDelSchedId(e.target.value)} className="mt-1" />
            </div>
          </div>
          <Button variant="destructive" onClick={handleDeleteScheduled} disabled={deletingSched || !delSchedChannel.trim() || !delSchedId.trim()}>
            {deletingSched ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Trash2 className="mr-2 h-4 w-4" />}
            Cancel Scheduled
          </Button>
          {delSchedResult && <JsonViewer data={delSchedResult} />}
        </CardContent>
      </Card>

      <Separator />

      {/* Get Permalink */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2"><Link className="h-4 w-4" /> Get Permalink</CardTitle>
          <CardDescription>Get a permanent URL for a specific message</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium">Channel ID</label>
              <Input placeholder="C01234567" value={plinkChannel} onChange={(e) => setPlinkChannel(e.target.value)} className="mt-1" />
            </div>
            <div>
              <label className="text-sm font-medium">Message Timestamp</label>
              <Input placeholder="1234567890.123456" value={plinkTs} onChange={(e) => setPlinkTs(e.target.value)} className="mt-1" />
            </div>
          </div>
          <Button onClick={handleGetPermalink} disabled={loadingPlink || !plinkChannel.trim() || !plinkTs.trim()}>
            {loadingPlink ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Link className="mr-2 h-4 w-4" />}
            Get Permalink
          </Button>
          {plinkResult && <JsonViewer data={plinkResult} />}
        </CardContent>
      </Card>

      <Separator />

      {/* Search Messages */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2"><Search className="h-4 w-4" /> Search Messages</CardTitle>
          <CardDescription>Search for messages across the workspace</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <label className="text-sm font-medium">Search Query</label>
            <Input placeholder="from:@user in:#channel keyword" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="mt-1" onKeyDown={(e) => e.key === 'Enter' && handleSearch()} />
          </div>
          <Button onClick={handleSearch} disabled={searching || !searchQuery.trim()}>
            {searching ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Search className="mr-2 h-4 w-4" />}
            Search
          </Button>
          {searchResult && <JsonViewer data={searchResult} />}
        </CardContent>
      </Card>
    </div>
  );
}
