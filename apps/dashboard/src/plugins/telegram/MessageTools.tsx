import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { tgGetMe, tgSendMessage, tgSendPhoto } from '../../lib/gateway-api';
import { usePluginConnection, Button, Input, Textarea, Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter, Alert, AlertDescription, Separator } from '@node2flow/dashboard-core';
import JsonViewer from '../n8n/components/JsonViewer';
import { Loader2, Send, Image, RefreshCw, AlertCircle, Bot, MessageSquare } from 'lucide-react';

export default function MessageTools() {
  const activeConnection = usePluginConnection('telegram');
  const connectionId = activeConnection?.id;
  const [botInfo, setBotInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [lastResult, setLastResult] = useState<any>(null);

  // Send Message form
  const [msgChatId, setMsgChatId] = useState('');
  const [msgText, setMsgText] = useState('');
  const [sending, setSending] = useState(false);

  // Send Photo form
  const [photoChatId, setPhotoChatId] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [photoCaption, setPhotoCaption] = useState('');
  const [sendingPhoto, setSendingPhoto] = useState(false);

  async function fetchBotInfo() {
    if (!connectionId) return;
    setLoading(true);
    setError('');
    const res = await tgGetMe(connectionId);
    if (res.success && res.data) {
      setBotInfo(res.data);
    } else {
      setError(res.error?.message || 'Failed to fetch bot info');
    }
    setLoading(false);
  }

  useEffect(() => {
    if (connectionId) fetchBotInfo();
  }, [connectionId]);

  async function handleSendMessage() {
    if (!msgChatId.trim() || !msgText.trim() || !connectionId) return;
    setSending(true);
    const res = await tgSendMessage(connectionId, msgChatId.trim(), msgText.trim());
    if (res.success) {
      toast.success('Message sent successfully');
      setLastResult(res.data);
      setMsgChatId('');
      setMsgText('');
    } else {
      toast.error(res.error?.message || 'Failed to send message');
    }
    setSending(false);
  }

  async function handleSendPhoto() {
    if (!photoChatId.trim() || !photoUrl.trim() || !connectionId) return;
    setSendingPhoto(true);
    const opts = photoCaption.trim() ? { caption: photoCaption.trim() } : {};
    const res = await tgSendPhoto(connectionId, photoChatId.trim(), photoUrl.trim(), opts);
    if (res.success) {
      toast.success('Photo sent successfully');
      setLastResult(res.data);
      setPhotoChatId('');
      setPhotoUrl('');
      setPhotoCaption('');
    } else {
      toast.error(res.error?.message || 'Failed to send photo');
    }
    setSendingPhoto(false);
  }

  if (!activeConnection) {
    return <div className="text-center py-12 text-muted-foreground">No connection selected. Please select a connection from the sidebar.</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Message Tools</h1>
          <p className="text-muted-foreground mt-1">{activeConnection.name} - Send messages and photos</p>
        </div>
        <Button variant="outline" size="icon" onClick={fetchBotInfo} title="Refresh">
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>

      {/* Bot Info Stat Card */}
      {!loading && botInfo && (
        <Card className="bg-gradient-to-t from-primary/5 to-card shadow-sm">
          <CardHeader className="pb-2">
            <CardDescription>Bot Information</CardDescription>
            <CardTitle className="text-xl font-semibold">{botInfo.first_name || 'Bot'}</CardTitle>
          </CardHeader>
          <CardContent className="text-sm space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">Username:</span>
              <span className="font-mono text-foreground">@{botInfo.username || 'N/A'}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">ID:</span>
              <span className="font-mono text-foreground">{botInfo.id}</span>
            </div>
            {botInfo.can_join_groups !== undefined && (
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">Can join groups:</span>
                <span className="text-foreground">{botInfo.can_join_groups ? 'Yes' : 'No'}</span>
              </div>
            )}
          </CardContent>
          <CardFooter className="text-sm text-muted-foreground">
            <Bot className="h-3.5 w-3.5 mr-1.5 text-primary" />
            Active bot
          </CardFooter>
        </Card>
      )}

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {loading && (
        <div className="flex justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      )}

      <Separator />

      {/* Send Message Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-primary" />
            Send Message
          </CardTitle>
          <CardDescription>Send a text message to a chat or user</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium text-foreground mb-1.5 block">Chat ID</label>
            <Input
              value={msgChatId}
              onChange={(e) => setMsgChatId(e.target.value)}
              placeholder="Chat ID or @username"
              className="font-mono"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-foreground mb-1.5 block">Message Text</label>
            <Textarea
              value={msgText}
              onChange={(e) => setMsgText(e.target.value)}
              placeholder="Enter your message..."
              rows={4}
            />
          </div>
          <Button
            className="bg-emerald-600 hover:bg-emerald-700 text-white"
            onClick={handleSendMessage}
            disabled={sending || !msgChatId.trim() || !msgText.trim()}
          >
            {sending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Send className="h-4 w-4 mr-2" />}
            Send Message
          </Button>
        </CardContent>
      </Card>

      {/* Send Photo Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Image className="h-5 w-5 text-primary" />
            Send Photo
          </CardTitle>
          <CardDescription>Send a photo to a chat or user</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium text-foreground mb-1.5 block">Chat ID</label>
            <Input
              value={photoChatId}
              onChange={(e) => setPhotoChatId(e.target.value)}
              placeholder="Chat ID or @username"
              className="font-mono"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-foreground mb-1.5 block">Photo URL</label>
            <Input
              value={photoUrl}
              onChange={(e) => setPhotoUrl(e.target.value)}
              placeholder="https://example.com/photo.jpg"
              className="font-mono"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-foreground mb-1.5 block">Caption (optional)</label>
            <Input
              value={photoCaption}
              onChange={(e) => setPhotoCaption(e.target.value)}
              placeholder="Optional photo caption"
            />
          </div>
          <Button
            className="bg-emerald-600 hover:bg-emerald-700 text-white"
            onClick={handleSendPhoto}
            disabled={sendingPhoto || !photoChatId.trim() || !photoUrl.trim()}
          >
            {sendingPhoto ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Image className="h-4 w-4 mr-2" />}
            Send Photo
          </Button>
        </CardContent>
      </Card>

      {/* Result Display */}
      {lastResult && (
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-foreground">Last Result</h3>
          <JsonViewer data={lastResult} title="Response Data" />
        </div>
      )}
    </div>
  );
}
