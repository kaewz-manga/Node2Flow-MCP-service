/**
 * Slack Plugin - Message Tools Page
 * Send messages, schedule messages, search messages
 */

import { useState, useEffect } from 'react';
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
  slackScheduleMessage,
  slackSearchMessages,
  slackGetTeamInfo,
} from '../../lib/gateway-api';
import { Send, Clock, Search, Info, Loader2, AlertCircle, Bot } from 'lucide-react';

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

  // Schedule Message
  const [schedChannel, setSchedChannel] = useState('');
  const [schedText, setSchedText] = useState('');
  const [schedTime, setSchedTime] = useState('');
  const [schedResult, setSchedResult] = useState<any>(null);
  const [scheduling, setScheduling] = useState(false);

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
    } catch (e) {
      toast.error(String(e));
    } finally {
      setLoadingTeam(false);
    }
  };

  const handleSendMessage = async () => {
    if (!sendChannel.trim() || !sendText.trim()) return;
    setSending(true);
    try {
      const res = await slackSendMessage(connectionId, sendChannel.trim(), sendText.trim());
      setSendResult(res.data ?? res.error);
      if (!res.error) toast.success('Message sent');
    } catch (e) {
      toast.error(String(e));
    } finally {
      setSending(false);
    }
  };

  const handleScheduleMessage = async () => {
    if (!schedChannel.trim() || !schedText.trim() || !schedTime) return;
    setScheduling(true);
    try {
      const postAt = Math.floor(new Date(schedTime).getTime() / 1000);
      const res = await slackScheduleMessage(connectionId, schedChannel.trim(), postAt, schedText.trim());
      setSchedResult(res.data ?? res.error);
      if (!res.error) toast.success('Message scheduled');
    } catch (e) {
      toast.error(String(e));
    } finally {
      setScheduling(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setSearching(true);
    try {
      const res = await slackSearchMessages(connectionId, searchQuery.trim());
      setSearchResult(res.data ?? res.error);
    } catch (e) {
      toast.error(String(e));
    } finally {
      setSearching(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Messages</h2>
        <p className="text-sm text-muted-foreground">Send, schedule, and search Slack messages</p>
      </div>

      {/* Team Info */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base flex items-center gap-2">
                <Bot className="h-4 w-4" /> Workspace Info
              </CardTitle>
              <CardDescription>Get information about the connected workspace</CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={handleGetTeamInfo} disabled={loadingTeam}>
              {loadingTeam ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Get Info'}
            </Button>
          </div>
        </CardHeader>
        {teamInfo && (
          <CardContent>
            <JsonViewer data={teamInfo} />
          </CardContent>
        )}
      </Card>

      <Separator />

      {/* Send Message */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Send className="h-4 w-4" /> Send Message
          </CardTitle>
          <CardDescription>Send a message to a channel or user</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <label className="text-sm font-medium">Channel ID</label>
            <Input
              placeholder="C01234567 or #general"
              value={sendChannel}
              onChange={(e) => setSendChannel(e.target.value)}
              className="mt-1"
            />
          </div>
          <div>
            <label className="text-sm font-medium">Message</label>
            <Textarea
              placeholder="Hello from Node2Flow!"
              value={sendText}
              onChange={(e) => setSendText(e.target.value)}
              className="mt-1"
              rows={3}
            />
          </div>
          <Button onClick={handleSendMessage} disabled={sending || !sendChannel.trim() || !sendText.trim()}>
            {sending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
            Send Message
          </Button>
          {sendResult && <JsonViewer data={sendResult} />}
        </CardContent>
      </Card>

      {/* Schedule Message */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Clock className="h-4 w-4" /> Schedule Message
          </CardTitle>
          <CardDescription>Schedule a message for a future time</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <label className="text-sm font-medium">Channel ID</label>
            <Input
              placeholder="C01234567"
              value={schedChannel}
              onChange={(e) => setSchedChannel(e.target.value)}
              className="mt-1"
            />
          </div>
          <div>
            <label className="text-sm font-medium">Message</label>
            <Textarea
              placeholder="Scheduled message content..."
              value={schedText}
              onChange={(e) => setSchedText(e.target.value)}
              className="mt-1"
              rows={3}
            />
          </div>
          <div>
            <label className="text-sm font-medium">Send At</label>
            <Input
              type="datetime-local"
              value={schedTime}
              onChange={(e) => setSchedTime(e.target.value)}
              className="mt-1"
            />
          </div>
          <Button onClick={handleScheduleMessage} disabled={scheduling || !schedChannel.trim() || !schedText.trim() || !schedTime}>
            {scheduling ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Clock className="mr-2 h-4 w-4" />}
            Schedule Message
          </Button>
          {schedResult && <JsonViewer data={schedResult} />}
        </CardContent>
      </Card>

      <Separator />

      {/* Search Messages */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Search className="h-4 w-4" /> Search Messages
          </CardTitle>
          <CardDescription>Search for messages across the workspace</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <label className="text-sm font-medium">Search Query</label>
            <Input
              placeholder="from:@user in:#channel keyword"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="mt-1"
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
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
