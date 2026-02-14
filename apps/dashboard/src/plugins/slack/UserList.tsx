/**
 * Slack Plugin - Users & Tools Page
 * List users, lookup user info, reactions, bookmarks, emoji
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
} from '@node2flow/dashboard-core';
import JsonViewer from '../n8n/components/JsonViewer';
import {
  slackListUsers,
  slackGetUserInfo,
  slackAddReaction,
  slackRemoveReaction,
  slackGetReactions,
  slackAddBookmark,
  slackEditBookmark,
  slackRemoveBookmark,
  slackListBookmarks,
  slackListEmoji,
} from '../../lib/gateway-api';
import {
  Users,
  UserSearch,
  SmilePlus,
  Smile,
  Trash2,
  Bookmark,
  BookmarkPlus,
  Pencil,
  Loader2,
  AlertCircle,
  RefreshCw,
  Link,
} from 'lucide-react';

interface SlackUser {
  id: string;
  name: string;
  real_name?: string;
  is_bot?: boolean;
  is_admin?: boolean;
  profile?: { image_48?: string; display_name?: string; email?: string };
}

export default function SlackUserList() {
  const activeConnection = usePluginConnection('slack');
  const connectionId = activeConnection?.id;

  // Users
  const [users, setUsers] = useState<SlackUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [userFilter, setUserFilter] = useState('');

  // User Info
  const [lookupId, setLookupId] = useState('');
  const [lookupResult, setLookupResult] = useState<any>(null);
  const [lookingUp, setLookingUp] = useState(false);

  // Add Reaction
  const [addReactChannel, setAddReactChannel] = useState('');
  const [addReactTs, setAddReactTs] = useState('');
  const [addReactName, setAddReactName] = useState('');
  const [addingReact, setAddingReact] = useState(false);

  // Remove Reaction
  const [rmReactChannel, setRmReactChannel] = useState('');
  const [rmReactTs, setRmReactTs] = useState('');
  const [rmReactName, setRmReactName] = useState('');
  const [removingReact, setRemovingReact] = useState(false);

  // Get Reactions
  const [getReactChannel, setGetReactChannel] = useState('');
  const [getReactTs, setGetReactTs] = useState('');
  const [reactResult, setReactResult] = useState<any>(null);
  const [loadingReact, setLoadingReact] = useState(false);

  // Bookmarks
  const [bmChannelId, setBmChannelId] = useState('');
  const [bookmarks, setBookmarks] = useState<any>(null);
  const [loadingBm, setLoadingBm] = useState(false);

  // Add Bookmark
  const [addBmChannel, setAddBmChannel] = useState('');
  const [addBmTitle, setAddBmTitle] = useState('');
  const [addBmLink, setAddBmLink] = useState('');
  const [addingBm, setAddingBm] = useState(false);

  // Edit Bookmark
  const [editBmId, setEditBmId] = useState('');
  const [editBmChannel, setEditBmChannel] = useState('');
  const [editBmTitle, setEditBmTitle] = useState('');
  const [editingBm, setEditingBm] = useState(false);

  // Remove Bookmark
  const [rmBmId, setRmBmId] = useState('');
  const [rmBmChannel, setRmBmChannel] = useState('');
  const [removingBm, setRemovingBm] = useState(false);

  // Emoji
  const [emojiResult, setEmojiResult] = useState<any>(null);
  const [loadingEmoji, setLoadingEmoji] = useState(false);

  const fetchUsers = useCallback(async () => {
    if (!connectionId) return;
    setLoading(true);
    try {
      const res = await slackListUsers(connectionId);
      const data = res.data as any;
      if (data?.members) {
        setUsers(data.members);
      } else if (Array.isArray(data)) {
        setUsers(data);
      } else {
        setUsers([]);
      }
    } catch (e) {
      toast.error(String(e));
    } finally {
      setLoading(false);
    }
  }, [connectionId]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  if (!connectionId) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">No connection selected</h3>
        <p className="text-muted-foreground">Select a Slack connection from the Connections page first.</p>
      </div>
    );
  }

  const handleLookup = async () => {
    if (!lookupId.trim()) return;
    setLookingUp(true);
    try {
      const res = await slackGetUserInfo(connectionId, lookupId.trim());
      setLookupResult(res.data ?? res.error);
    } catch (e) { toast.error(String(e)); } finally { setLookingUp(false); }
  };

  const handleAddReaction = async () => {
    if (!addReactChannel.trim() || !addReactTs.trim() || !addReactName.trim()) return;
    setAddingReact(true);
    try {
      const res = await slackAddReaction(connectionId, addReactChannel.trim(), addReactTs.trim(), addReactName.trim());
      if (res.error) toast.error(String(res.error));
      else toast.success(`Reaction :${addReactName}: added`);
    } catch (e) { toast.error(String(e)); } finally { setAddingReact(false); }
  };

  const handleRemoveReaction = async () => {
    if (!rmReactChannel.trim() || !rmReactTs.trim() || !rmReactName.trim()) return;
    setRemovingReact(true);
    try {
      const res = await slackRemoveReaction(connectionId, rmReactChannel.trim(), rmReactTs.trim(), rmReactName.trim());
      if (res.error) toast.error(String(res.error));
      else toast.success(`Reaction :${rmReactName}: removed`);
    } catch (e) { toast.error(String(e)); } finally { setRemovingReact(false); }
  };

  const handleGetReactions = async () => {
    if (!getReactChannel.trim() || !getReactTs.trim()) return;
    setLoadingReact(true);
    try {
      const res = await slackGetReactions(connectionId, getReactChannel.trim(), getReactTs.trim());
      setReactResult(res.data ?? res.error);
    } catch (e) { toast.error(String(e)); } finally { setLoadingReact(false); }
  };

  const handleListBookmarks = async () => {
    if (!bmChannelId.trim()) return;
    setLoadingBm(true);
    try {
      const res = await slackListBookmarks(connectionId, bmChannelId.trim());
      setBookmarks(res.data ?? res.error);
    } catch (e) { toast.error(String(e)); } finally { setLoadingBm(false); }
  };

  const handleAddBookmark = async () => {
    if (!addBmChannel.trim() || !addBmTitle.trim() || !addBmLink.trim()) return;
    setAddingBm(true);
    try {
      const res = await slackAddBookmark(connectionId, addBmChannel.trim(), addBmTitle.trim(), addBmLink.trim());
      if (res.error) toast.error(String(res.error));
      else toast.success(`Bookmark "${addBmTitle}" added`);
    } catch (e) { toast.error(String(e)); } finally { setAddingBm(false); }
  };

  const handleEditBookmark = async () => {
    if (!editBmId.trim() || !editBmChannel.trim()) return;
    setEditingBm(true);
    try {
      const opts: Record<string, unknown> = {};
      if (editBmTitle.trim()) opts.title = editBmTitle.trim();
      const res = await slackEditBookmark(connectionId, editBmId.trim(), editBmChannel.trim(), opts);
      if (res.error) toast.error(String(res.error));
      else toast.success('Bookmark updated');
    } catch (e) { toast.error(String(e)); } finally { setEditingBm(false); }
  };

  const handleRemoveBookmark = async () => {
    if (!rmBmId.trim() || !rmBmChannel.trim()) return;
    setRemovingBm(true);
    try {
      const res = await slackRemoveBookmark(connectionId, rmBmId.trim(), rmBmChannel.trim());
      if (res.error) toast.error(String(res.error));
      else toast.success('Bookmark removed');
    } catch (e) { toast.error(String(e)); } finally { setRemovingBm(false); }
  };

  const handleListEmoji = async () => {
    setLoadingEmoji(true);
    try {
      const res = await slackListEmoji(connectionId);
      setEmojiResult(res.data ?? res.error);
    } catch (e) { toast.error(String(e)); } finally { setLoadingEmoji(false); }
  };

  const filteredUsers = userFilter
    ? users.filter((u) =>
        u.name.toLowerCase().includes(userFilter.toLowerCase()) ||
        u.real_name?.toLowerCase().includes(userFilter.toLowerCase()) ||
        u.profile?.display_name?.toLowerCase().includes(userFilter.toLowerCase())
      )
    : users;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Users & Tools</h2>
          <p className="text-sm text-muted-foreground">Manage users, reactions, bookmarks, and emoji</p>
        </div>
        <Button variant="outline" size="icon" onClick={fetchUsers} disabled={loading}>
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
        </Button>
      </div>

      {/* User List */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Users className="h-4 w-4" /> Users ({users.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Input
            placeholder="Filter by name..."
            value={userFilter}
            onChange={(e) => setUserFilter(e.target.value)}
          />
          {loading && users.length === 0 ? (
            <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin" /></div>
          ) : filteredUsers.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">No users found</p>
          ) : (
            <div className="space-y-1 max-h-80 overflow-auto">
              {filteredUsers.slice(0, 100).map((user) => (
                <div key={user.id} className="flex items-center justify-between rounded bg-muted/50 px-3 py-2">
                  <div className="flex items-center gap-3 min-w-0">
                    {user.profile?.image_48 ? (
                      <img src={user.profile.image_48} alt="" className="h-6 w-6 rounded-full shrink-0" />
                    ) : (
                      <Users className="h-4 w-4 shrink-0 text-muted-foreground" />
                    )}
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">
                        {user.real_name || user.name}
                        {user.is_bot && <span className="ml-1 text-xs text-blue-500">[bot]</span>}
                        {user.is_admin && <span className="ml-1 text-xs text-amber-500">[admin]</span>}
                      </p>
                      <p className="text-xs text-muted-foreground">@{user.name} · {user.id}</p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="shrink-0"
                    onClick={() => { setLookupId(user.id); }}
                  >
                    <UserSearch className="h-3 w-3" />
                  </Button>
                </div>
              ))}
              {filteredUsers.length > 100 && (
                <p className="text-xs text-muted-foreground text-center py-2">
                  Showing 100 of {filteredUsers.length} users
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* User Lookup */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <UserSearch className="h-4 w-4" /> User Lookup
          </CardTitle>
          <CardDescription>Get detailed info about a specific user</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex gap-2">
            <Input placeholder="User ID (U01234567)" value={lookupId} onChange={(e) => setLookupId(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleLookup()} />
            <Button onClick={handleLookup} disabled={lookingUp || !lookupId.trim()}>
              {lookingUp ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Lookup'}
            </Button>
          </div>
          {lookupResult && <JsonViewer data={lookupResult} />}
        </CardContent>
      </Card>

      <Separator />

      {/* Reactions */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <SmilePlus className="h-4 w-4" /> Add Reaction
          </CardTitle>
          <CardDescription>Add an emoji reaction to a message</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-sm font-medium">Channel ID</label>
              <Input placeholder="C01234567" value={addReactChannel} onChange={(e) => setAddReactChannel(e.target.value)} className="mt-1" />
            </div>
            <div>
              <label className="text-sm font-medium">Timestamp</label>
              <Input placeholder="1234567890.123456" value={addReactTs} onChange={(e) => setAddReactTs(e.target.value)} className="mt-1" />
            </div>
            <div>
              <label className="text-sm font-medium">Emoji Name</label>
              <Input placeholder="thumbsup" value={addReactName} onChange={(e) => setAddReactName(e.target.value)} className="mt-1" />
            </div>
          </div>
          <Button onClick={handleAddReaction} disabled={addingReact || !addReactChannel.trim() || !addReactTs.trim() || !addReactName.trim()}>
            {addingReact ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <SmilePlus className="mr-2 h-4 w-4" />}
            Add Reaction
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Trash2 className="h-4 w-4" /> Remove Reaction
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-sm font-medium">Channel ID</label>
              <Input placeholder="C01234567" value={rmReactChannel} onChange={(e) => setRmReactChannel(e.target.value)} className="mt-1" />
            </div>
            <div>
              <label className="text-sm font-medium">Timestamp</label>
              <Input placeholder="1234567890.123456" value={rmReactTs} onChange={(e) => setRmReactTs(e.target.value)} className="mt-1" />
            </div>
            <div>
              <label className="text-sm font-medium">Emoji Name</label>
              <Input placeholder="thumbsup" value={rmReactName} onChange={(e) => setRmReactName(e.target.value)} className="mt-1" />
            </div>
          </div>
          <Button variant="destructive" onClick={handleRemoveReaction} disabled={removingReact || !rmReactChannel.trim() || !rmReactTs.trim() || !rmReactName.trim()}>
            {removingReact ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Trash2 className="mr-2 h-4 w-4" />}
            Remove Reaction
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Smile className="h-4 w-4" /> Get Reactions
          </CardTitle>
          <CardDescription>See all reactions on a specific message</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium">Channel ID</label>
              <Input placeholder="C01234567" value={getReactChannel} onChange={(e) => setGetReactChannel(e.target.value)} className="mt-1" />
            </div>
            <div>
              <label className="text-sm font-medium">Timestamp</label>
              <Input placeholder="1234567890.123456" value={getReactTs} onChange={(e) => setGetReactTs(e.target.value)} className="mt-1" />
            </div>
          </div>
          <Button onClick={handleGetReactions} disabled={loadingReact || !getReactChannel.trim() || !getReactTs.trim()}>
            {loadingReact ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Smile className="mr-2 h-4 w-4" />}
            Get Reactions
          </Button>
          {reactResult && <JsonViewer data={reactResult} />}
        </CardContent>
      </Card>

      <Separator />

      {/* Bookmarks */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Bookmark className="h-4 w-4" /> Channel Bookmarks
          </CardTitle>
          <CardDescription>List bookmarks in a channel</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex gap-2">
            <Input placeholder="Channel ID (C01234567)" value={bmChannelId} onChange={(e) => setBmChannelId(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleListBookmarks()} />
            <Button onClick={handleListBookmarks} disabled={loadingBm || !bmChannelId.trim()}>
              {loadingBm ? <Loader2 className="h-4 w-4 animate-spin" /> : 'List'}
            </Button>
          </div>
          {bookmarks && <JsonViewer data={bookmarks} />}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <BookmarkPlus className="h-4 w-4" /> Add Bookmark
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-sm font-medium">Channel ID</label>
              <Input placeholder="C01234567" value={addBmChannel} onChange={(e) => setAddBmChannel(e.target.value)} className="mt-1" />
            </div>
            <div>
              <label className="text-sm font-medium">Title</label>
              <Input placeholder="Design Docs" value={addBmTitle} onChange={(e) => setAddBmTitle(e.target.value)} className="mt-1" />
            </div>
            <div>
              <label className="text-sm font-medium">Link</label>
              <Input placeholder="https://..." value={addBmLink} onChange={(e) => setAddBmLink(e.target.value)} className="mt-1" />
            </div>
          </div>
          <Button onClick={handleAddBookmark} disabled={addingBm || !addBmChannel.trim() || !addBmTitle.trim() || !addBmLink.trim()}>
            {addingBm ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <BookmarkPlus className="mr-2 h-4 w-4" />}
            Add Bookmark
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Pencil className="h-4 w-4" /> Edit Bookmark
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-sm font-medium">Bookmark ID</label>
              <Input placeholder="Bk01234567" value={editBmId} onChange={(e) => setEditBmId(e.target.value)} className="mt-1" />
            </div>
            <div>
              <label className="text-sm font-medium">Channel ID</label>
              <Input placeholder="C01234567" value={editBmChannel} onChange={(e) => setEditBmChannel(e.target.value)} className="mt-1" />
            </div>
            <div>
              <label className="text-sm font-medium">New Title (optional)</label>
              <Input placeholder="Updated title" value={editBmTitle} onChange={(e) => setEditBmTitle(e.target.value)} className="mt-1" />
            </div>
          </div>
          <Button onClick={handleEditBookmark} disabled={editingBm || !editBmId.trim() || !editBmChannel.trim()}>
            {editingBm ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Pencil className="mr-2 h-4 w-4" />}
            Update Bookmark
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Trash2 className="h-4 w-4" /> Remove Bookmark
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium">Bookmark ID</label>
              <Input placeholder="Bk01234567" value={rmBmId} onChange={(e) => setRmBmId(e.target.value)} className="mt-1" />
            </div>
            <div>
              <label className="text-sm font-medium">Channel ID</label>
              <Input placeholder="C01234567" value={rmBmChannel} onChange={(e) => setRmBmChannel(e.target.value)} className="mt-1" />
            </div>
          </div>
          <Button variant="destructive" onClick={handleRemoveBookmark} disabled={removingBm || !rmBmId.trim() || !rmBmChannel.trim()}>
            {removingBm ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Trash2 className="mr-2 h-4 w-4" />}
            Remove Bookmark
          </Button>
        </CardContent>
      </Card>

      <Separator />

      {/* Emoji */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base flex items-center gap-2"><Smile className="h-4 w-4" /> Custom Emoji</CardTitle>
              <CardDescription>List all custom emoji in the workspace</CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={handleListEmoji} disabled={loadingEmoji}>
              {loadingEmoji ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Load'}
            </Button>
          </div>
        </CardHeader>
        {emojiResult && <CardContent><JsonViewer data={emojiResult} /></CardContent>}
      </Card>
    </div>
  );
}
