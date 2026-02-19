import { useState } from 'react';
import { toast } from 'sonner';
import { tgGetChat, tgGetChatMember, tgBanChatMember, tgUnbanChatMember, tgCreateChatInviteLink } from '../../lib/gateway-api';
import { usePluginConnection, Button, Input, Card, CardContent, CardHeader, CardTitle, CardDescription, Separator, Alert, AlertDescription } from '@node2flow/dashboard-core';
import ConfirmDialog from '../n8n/components/ConfirmDialog';
import JsonViewer from '../n8n/components/JsonViewer';
import { Loader2, Search, Users, UserMinus, UserPlus, Link as LinkIcon, Shield } from 'lucide-react';

export default function ChatManagement() {
  const activeConnection = usePluginConnection('telegram');
  const connectionId = activeConnection?.id;
  const [chatResult, setChatResult] = useState<any>(null);
  const [memberResult, setMemberResult] = useState<any>(null);
  const [inviteResult, setInviteResult] = useState<any>(null);

  // Get Chat
  const [chatId, setChatId] = useState('');
  const [loadingChat, setLoadingChat] = useState(false);

  // Get Member
  const [memberChatId, setMemberChatId] = useState('');
  const [userId, setUserId] = useState('');
  const [loadingMember, setLoadingMember] = useState(false);

  // Moderation
  const [modChatId, setModChatId] = useState('');
  const [modUserId, setModUserId] = useState('');
  const [banTarget, setBanTarget] = useState<{ chatId: string; userId: string } | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_banning, setBanning] = useState(false);
  const [unbanning, setUnbanning] = useState(false);

  // Invite Link
  const [inviteChatId, setInviteChatId] = useState('');
  const [inviteName, setInviteName] = useState('');
  const [inviteExpire, setInviteExpire] = useState('');
  const [creatingInvite, setCreatingInvite] = useState(false);

  async function handleGetChat() {
    if (!chatId.trim() || !connectionId) return;
    setLoadingChat(true);
    const res = await tgGetChat(connectionId, chatId.trim());
    if (res.success) {
      toast.success('Chat info retrieved');
      setChatResult(res.data);
    } else {
      toast.error(res.error?.message || 'Failed to get chat info');
    }
    setLoadingChat(false);
  }

  async function handleGetMember() {
    if (!memberChatId.trim() || !userId.trim() || !connectionId) return;
    setLoadingMember(true);
    const res = await tgGetChatMember(connectionId, memberChatId.trim(), parseInt(userId.trim()));
    if (res.success) {
      toast.success('Member info retrieved');
      setMemberResult(res.data);
    } else {
      toast.error(res.error?.message || 'Failed to get member info');
    }
    setLoadingMember(false);
  }

  async function handleBan() {
    if (!banTarget || !connectionId) return;
    setBanning(true);
    const res = await tgBanChatMember(connectionId, banTarget.chatId, parseInt(banTarget.userId));
    if (res.success) {
      toast.success('Member banned successfully');
      setBanTarget(null);
      setModChatId('');
      setModUserId('');
    } else {
      toast.error(res.error?.message || 'Failed to ban member');
    }
    setBanning(false);
  }

  async function handleUnban() {
    if (!modChatId.trim() || !modUserId.trim() || !connectionId) return;
    setUnbanning(true);
    const res = await tgUnbanChatMember(connectionId, modChatId.trim(), parseInt(modUserId.trim()));
    if (res.success) {
      toast.success('Member unbanned successfully');
      setModChatId('');
      setModUserId('');
    } else {
      toast.error(res.error?.message || 'Failed to unban member');
    }
    setUnbanning(false);
  }

  async function handleCreateInvite() {
    if (!inviteChatId.trim() || !connectionId) return;
    setCreatingInvite(true);
    const opts: any = {};
    if (inviteName.trim()) opts.name = inviteName.trim();
    if (inviteExpire.trim()) opts.expire_date = parseInt(inviteExpire.trim());
    const res = await tgCreateChatInviteLink(connectionId, inviteChatId.trim(), opts);
    if (res.success) {
      toast.success('Invite link created');
      setInviteResult(res.data);
      setInviteChatId('');
      setInviteName('');
      setInviteExpire('');
    } else {
      toast.error(res.error?.message || 'Failed to create invite link');
    }
    setCreatingInvite(false);
  }

  if (!activeConnection) {
    return <div className="text-center py-12 text-muted-foreground">No connection selected. Please select a connection from the sidebar.</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Chat Management</h1>
        <p className="text-muted-foreground mt-1">{activeConnection.name} - Lookup chats, members, and moderation</p>
      </div>

      {/* Get Chat Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5 text-primary" />
            Lookup Chat
          </CardTitle>
          <CardDescription>Get information about a chat or group</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium text-foreground mb-1.5 block">Chat ID</label>
            <Input
              value={chatId}
              onChange={(e) => setChatId(e.target.value)}
              placeholder="Chat ID or @username"
              className="font-mono"
            />
          </div>
          <Button
           
            onClick={handleGetChat}
            disabled={loadingChat || !chatId.trim()}
          >
            {loadingChat ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Search className="h-4 w-4 mr-2" />}
            Get Info
          </Button>
        </CardContent>
      </Card>

      {chatResult && (
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-foreground">Chat Information</h3>
          {chatResult.title && (
            <Alert className="bg-gradient-to-t from-green-500/5 to-card">
              <Users className="h-4 w-4" />
              <AlertDescription>
                <div className="space-y-1">
                  <div><span className="font-semibold">Title:</span> {chatResult.title}</div>
                  <div><span className="font-semibold">Type:</span> {chatResult.type}</div>
                  {chatResult.description && <div><span className="font-semibold">Description:</span> {chatResult.description}</div>}
                </div>
              </AlertDescription>
            </Alert>
          )}
          <JsonViewer data={chatResult} title="Full Chat Data" />
        </div>
      )}

      <Separator />

      {/* Get Member Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            Member Lookup
          </CardTitle>
          <CardDescription>Get member status in a chat</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium text-foreground mb-1.5 block">Chat ID</label>
            <Input
              value={memberChatId}
              onChange={(e) => setMemberChatId(e.target.value)}
              placeholder="Chat ID"
              className="font-mono"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-foreground mb-1.5 block">User ID</label>
            <Input
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              placeholder="User ID"
              className="font-mono"
            />
          </div>
          <Button
           
            onClick={handleGetMember}
            disabled={loadingMember || !memberChatId.trim() || !userId.trim()}
          >
            {loadingMember ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Search className="h-4 w-4 mr-2" />}
            Get Member
          </Button>
        </CardContent>
      </Card>

      {memberResult && (
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-foreground">Member Information</h3>
          <JsonViewer data={memberResult} title="Member Data" />
        </div>
      )}

      <Separator />

      {/* Moderation */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            Moderation
          </CardTitle>
          <CardDescription>Ban or unban members from a chat</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium text-foreground mb-1.5 block">Chat ID</label>
            <Input
              value={modChatId}
              onChange={(e) => setModChatId(e.target.value)}
              placeholder="Chat ID"
              className="font-mono"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-foreground mb-1.5 block">User ID</label>
            <Input
              value={modUserId}
              onChange={(e) => setModUserId(e.target.value)}
              placeholder="User ID"
              className="font-mono"
            />
          </div>
          <div className="flex gap-3">
            <Button
              variant="destructive"
              onClick={() => setBanTarget({ chatId: modChatId, userId: modUserId })}
              disabled={!modChatId.trim() || !modUserId.trim()}
            >
              <UserMinus className="h-4 w-4 mr-2" />
              Ban
            </Button>
            <Button
             
              onClick={handleUnban}
              disabled={unbanning || !modChatId.trim() || !modUserId.trim()}
            >
              {unbanning ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <UserPlus className="h-4 w-4 mr-2" />}
              Unban
            </Button>
          </div>
        </CardContent>
      </Card>

      <Separator />

      {/* Create Invite Link */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <LinkIcon className="h-5 w-5 text-primary" />
            Create Invite Link
          </CardTitle>
          <CardDescription>Generate an invite link for a chat</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium text-foreground mb-1.5 block">Chat ID</label>
            <Input
              value={inviteChatId}
              onChange={(e) => setInviteChatId(e.target.value)}
              placeholder="Chat ID"
              className="font-mono"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-foreground mb-1.5 block">Name (optional)</label>
            <Input
              value={inviteName}
              onChange={(e) => setInviteName(e.target.value)}
              placeholder="Invite link name"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-foreground mb-1.5 block">Expire Date (optional, Unix timestamp)</label>
            <Input
              value={inviteExpire}
              onChange={(e) => setInviteExpire(e.target.value)}
              placeholder="1735689600"
              className="font-mono"
            />
          </div>
          <Button
           
            onClick={handleCreateInvite}
            disabled={creatingInvite || !inviteChatId.trim()}
          >
            {creatingInvite ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <LinkIcon className="h-4 w-4 mr-2" />}
            Create Link
          </Button>
        </CardContent>
      </Card>

      {inviteResult && (
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-foreground">Invite Link Created</h3>
          {inviteResult.invite_link && (
            <Alert className="bg-gradient-to-t from-green-500/5 to-card">
              <LinkIcon className="h-4 w-4" />
              <AlertDescription>
                <div className="space-y-1">
                  <div className="font-semibold">Link:</div>
                  <code className="block bg-muted p-2 rounded text-xs break-all">{inviteResult.invite_link}</code>
                </div>
              </AlertDescription>
            </Alert>
          )}
          <JsonViewer data={inviteResult} title="Full Invite Data" />
        </div>
      )}

      <ConfirmDialog
        open={!!banTarget}
        title="Ban Member"
        message={`Ban user ${banTarget?.userId} from chat ${banTarget?.chatId}? This action will remove them from the chat.`}
        onConfirm={handleBan}
        onCancel={() => setBanTarget(null)}
      />
    </div>
  );
}
