import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { lineGetBotInfo, lineGetProfile, lineGetFollowerIds, lineGetGroupSummary, lineGetGroupMembersCount, lineGetGroupMemberIds } from '../../lib/gateway-api';
import { usePluginConnection, Button, Input, Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter, Alert, AlertDescription, Separator, Badge } from '@node2flow/dashboard-core';
import JsonViewer from '../n8n/components/JsonViewer';
import { Loader2, RefreshCw, AlertCircle, Users, User, Bot, Search, UsersRound } from 'lucide-react';

export default function UserList() {
  const activeConnection = usePluginConnection('line');
  const connectionId = activeConnection?.id;
  const [botInfo, setBotInfo] = useState<any>(null);
  const [followers, setFollowers] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Follower pagination
  const [followerNextToken, setFollowerNextToken] = useState<string | null>(null);
  const [loadingMoreFollowers, setLoadingMoreFollowers] = useState(false);

  // Profile lookup
  const [userId, setUserId] = useState('');
  const [profile, setProfile] = useState<any>(null);
  const [lookingUp, setLookingUp] = useState(false);

  // Group lookup
  const [groupId, setGroupId] = useState('');
  const [groupInfo, setGroupInfo] = useState<any>(null);
  const [groupMembers, setGroupMembers] = useState<any>(null);
  const [lookingUpGroup, setLookingUpGroup] = useState(false);

  async function fetchData() {
    if (!connectionId) return;
    setLoading(true);
    setError('');
    try {
      const [botRes, followerRes] = await Promise.all([
        lineGetBotInfo(connectionId),
        lineGetFollowerIds(connectionId),
      ]);
      if (botRes.success && botRes.data) setBotInfo(botRes.data);
      if (followerRes.success && followerRes.data) {
        setFollowers(followerRes.data);
        const data = followerRes.data as any;
        setFollowerNextToken(data.next || null);
      }
      if (!botRes.success) setError(botRes.error?.message || 'Failed to fetch bot info');
    } catch {
      setError('Failed to load data');
    }
    setLoading(false);
  }

  useEffect(() => { if (connectionId) fetchData(); }, [connectionId]);

  async function handleLoadMoreFollowers() {
    if (!connectionId || !followerNextToken) return;
    setLoadingMoreFollowers(true);
    try {
      const res = await lineGetFollowerIds(connectionId, followerNextToken);
      if (res.success && res.data) {
        const data = res.data as any;
        const newIds = data.userIds || [];
        setFollowers((prev: any) => ({
          ...prev,
          userIds: [...((prev as any)?.userIds || []), ...newIds],
        }));
        setFollowerNextToken(data.next || null);
      } else {
        toast.error(res.error?.message || 'Failed to load more followers');
      }
    } catch {
      toast.error('Failed to load more followers');
    }
    setLoadingMoreFollowers(false);
  }

  async function handleLookupUser() {
    if (!userId.trim() || !connectionId) return;
    setLookingUp(true);
    setProfile(null);
    const res = await lineGetProfile(connectionId, userId.trim());
    if (res.success && res.data) {
      setProfile(res.data);
    } else {
      toast.error(res.error?.message || 'Failed to get profile');
    }
    setLookingUp(false);
  }

  async function handleLookupGroup() {
    if (!groupId.trim() || !connectionId) return;
    setLookingUpGroup(true);
    setGroupInfo(null);
    setGroupMembers(null);
    try {
      const [summaryRes, countRes, memberRes] = await Promise.all([
        lineGetGroupSummary(connectionId, groupId.trim()),
        lineGetGroupMembersCount(connectionId, groupId.trim()),
        lineGetGroupMemberIds(connectionId, groupId.trim()),
      ]);
      if (summaryRes.success && summaryRes.data) setGroupInfo(summaryRes.data);
      if (countRes.success || memberRes.success) {
        setGroupMembers({ count: countRes.data, members: memberRes.data });
      }
      if (!summaryRes.success) toast.error(summaryRes.error?.message || 'Failed');
    } catch {
      toast.error('Failed to fetch group info');
    }
    setLookingUpGroup(false);
  }

  const followerIds = (followers as any)?.userIds || [];

  if (!activeConnection) {
    return (
      <Card><CardContent className="text-center py-12">
        <h3 className="text-lg font-medium text-foreground mb-2">No connection selected</h3>
        <p className="text-sm text-muted-foreground">Select a connection from the sidebar to continue.</p>
      </CardContent></Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Users & Groups</h1>
          <p className="text-muted-foreground mt-1">{activeConnection.name} <Badge variant="secondary" className="ml-1">8 tools</Badge></p>
        </div>
        <Button variant="outline" size="icon" onClick={fetchData} title="Refresh"><RefreshCw className="h-4 w-4" /></Button>
      </div>

      {/* Stat Cards */}
      {!loading && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <Card className="bg-gradient-to-t from-primary/5 to-card shadow-sm">
            <CardHeader className="pb-2">
              <CardDescription>Bot</CardDescription>
              <CardTitle className="text-lg font-semibold truncate">{botInfo?.displayName || '-'}</CardTitle>
            </CardHeader>
            <CardFooter className="text-sm text-muted-foreground">
              <Bot className="h-3.5 w-3.5 mr-1.5 text-primary" />
              {botInfo?.chatMode || '-'} mode
            </CardFooter>
          </Card>
          <Card className="bg-gradient-to-t from-emerald-500/5 to-card shadow-sm">
            <CardHeader className="pb-2">
              <CardDescription>Followers</CardDescription>
              <CardTitle className="text-2xl font-semibold tabular-nums">{followerIds.length}</CardTitle>
            </CardHeader>
            <CardFooter className="text-sm text-muted-foreground">
              <Users className="h-3.5 w-3.5 mr-1.5 text-emerald-500" />
              Known user IDs
            </CardFooter>
          </Card>
          <Card className="bg-gradient-to-t from-amber-500/5 to-card shadow-sm">
            <CardHeader className="pb-2">
              <CardDescription>Bot ID</CardDescription>
              <CardTitle className="text-sm font-semibold truncate font-mono">{botInfo?.userId?.substring(0, 16) || '-'}...</CardTitle>
            </CardHeader>
            <CardFooter className="text-sm text-muted-foreground">
              <User className="h-3.5 w-3.5 mr-1.5 text-amber-500" />
              {botInfo?.basicId || '-'}
            </CardFooter>
          </Card>
        </div>
      )}

      <Separator />

      {error && (
        <Alert variant="destructive"><AlertCircle className="h-4 w-4" /><AlertDescription>{error}</AlertDescription></Alert>
      )}

      {loading ? (
        <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
      ) : (
        <>
          {/* User Profile Lookup */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2"><Search className="h-4 w-4 text-primary" /> User Profile Lookup</CardTitle>
              <CardDescription>Look up a LINE user's display name, picture, and status</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex gap-2">
                <Input
                  value={userId}
                  onChange={(e) => setUserId(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') handleLookupUser(); }}
                  placeholder="User ID (e.g. U1234...)"
                  className="flex-1"
                />
                <Button className="bg-emerald-600 hover:bg-emerald-700 text-white" onClick={handleLookupUser} disabled={lookingUp || !userId.trim()}>
                  {lookingUp ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Search className="h-4 w-4 mr-2" />}
                  Lookup
                </Button>
              </div>
              {profile && (
                <div className="flex items-center gap-4 p-3 rounded-lg bg-muted/30">
                  {(profile as any).pictureUrl && (
                    <img src={(profile as any).pictureUrl} alt="" className="h-12 w-12 rounded-full" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground">{(profile as any).displayName}</p>
                    <p className="text-sm text-muted-foreground">{(profile as any).statusMessage || 'No status'}</p>
                    <p className="text-xs text-muted-foreground font-mono">{(profile as any).userId}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Group Lookup */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2"><UsersRound className="h-4 w-4 text-primary" /> Group Lookup</CardTitle>
              <CardDescription>Get group summary, member count, and member IDs</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex gap-2">
                <Input
                  value={groupId}
                  onChange={(e) => setGroupId(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') handleLookupGroup(); }}
                  placeholder="Group ID (e.g. C1234...)"
                  className="flex-1"
                />
                <Button className="bg-emerald-600 hover:bg-emerald-700 text-white" onClick={handleLookupGroup} disabled={lookingUpGroup || !groupId.trim()}>
                  {lookingUpGroup ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Search className="h-4 w-4 mr-2" />}
                  Lookup
                </Button>
              </div>
              {groupInfo && (
                <div className="space-y-2">
                  <div className="flex items-center gap-4 p-3 rounded-lg bg-muted/30">
                    {(groupInfo as any).pictureUrl && (
                      <img src={(groupInfo as any).pictureUrl} alt="" className="h-12 w-12 rounded-full" />
                    )}
                    <div>
                      <p className="font-medium text-foreground">{(groupInfo as any).groupName}</p>
                      <p className="text-xs text-muted-foreground font-mono">{(groupInfo as any).groupId}</p>
                    </div>
                  </div>
                  {groupMembers && <JsonViewer data={groupMembers} />}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Follower IDs */}
          {followerIds.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2"><Users className="h-4 w-4 text-primary" /> Follower IDs ({followerIds.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="max-h-48 overflow-y-auto rounded-md bg-muted/20 p-3 space-y-1">
                  {followerIds.map((id: string, i: number) => (
                    <div key={i} className="flex items-center gap-2">
                      <span className="text-xs font-mono text-muted-foreground">{id}</span>
                      <Button variant="ghost" size="sm" className="h-6 text-xs" onClick={() => { setUserId(id); handleLookupUser(); }}>
                        Lookup
                      </Button>
                    </div>
                  ))}
                </div>
                {followerNextToken && (
                  <div className="mt-3 flex justify-center">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleLoadMoreFollowers}
                      disabled={loadingMoreFollowers}
                    >
                      {loadingMoreFollowers ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Users className="h-4 w-4 mr-2" />}
                      Load More
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
