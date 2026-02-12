import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { lineGetBotInfo, linePushMessage, lineGetQuota, lineGetQuotaConsumption } from '../../lib/gateway-api';
import { usePluginConnection, Button, Input, Textarea, Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter, Alert, AlertDescription, Separator, Badge } from '@node2flow/dashboard-core';
import JsonViewer from '../n8n/components/JsonViewer';
import { Loader2, RefreshCw, AlertCircle, Send, Bot, Gauge, MessageSquare } from 'lucide-react';

export default function MessageTools() {
  const activeConnection = usePluginConnection('line');
  const connectionId = activeConnection?.id;
  const [botInfo, setBotInfo] = useState<any>(null);
  const [quota, setQuota] = useState<any>(null);
  const [consumption, setConsumption] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Send message form
  const [to, setTo] = useState('');
  const [messageText, setMessageText] = useState('');
  const [sending, setSending] = useState(false);
  const [lastResult, setLastResult] = useState<any>(null);

  async function fetchData() {
    if (!connectionId) return;
    setLoading(true);
    setError('');
    try {
      const [botRes, quotaRes, consumptionRes] = await Promise.all([
        lineGetBotInfo(connectionId),
        lineGetQuota(connectionId),
        lineGetQuotaConsumption(connectionId),
      ]);
      if (botRes.success && botRes.data) setBotInfo(botRes.data);
      if (quotaRes.success && quotaRes.data) setQuota(quotaRes.data);
      if (consumptionRes.success && consumptionRes.data) setConsumption(consumptionRes.data);
      if (!botRes.success) setError(botRes.error?.message || 'Failed to fetch bot info');
    } catch {
      setError('Failed to load data');
    }
    setLoading(false);
  }

  useEffect(() => { if (connectionId) fetchData(); }, [connectionId]);

  async function handleSend() {
    if (!to.trim() || !messageText.trim() || !connectionId) return;
    setSending(true);
    const res = await linePushMessage(connectionId, to.trim(), [{ type: 'text', text: messageText.trim() }]);
    if (res.success) {
      toast.success('Message sent');
      setLastResult(res.data);
      setMessageText('');
    } else {
      toast.error(res.error?.message || 'Failed to send');
      setLastResult(res.error);
    }
    setSending(false);
  }

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
          <h1 className="text-2xl font-bold text-foreground">Message Tools</h1>
          <p className="text-muted-foreground mt-1">{activeConnection.name} <Badge variant="secondary" className="ml-1">5 tools</Badge></p>
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
              {botInfo?.basicId || 'Loading...'}
            </CardFooter>
          </Card>
          <Card className="bg-gradient-to-t from-green-500/5 to-card shadow-sm">
            <CardHeader className="pb-2">
              <CardDescription>Message Quota</CardDescription>
              <CardTitle className="text-2xl font-semibold tabular-nums">{quota?.value?.toLocaleString() || '-'}</CardTitle>
            </CardHeader>
            <CardFooter className="text-sm text-muted-foreground">
              <Gauge className="h-3.5 w-3.5 mr-1.5 text-green-500" />
              Monthly limit ({quota?.type || '-'})
            </CardFooter>
          </Card>
          <Card className="bg-gradient-to-t from-amber-500/5 to-card shadow-sm">
            <CardHeader className="pb-2">
              <CardDescription>Sent This Month</CardDescription>
              <CardTitle className="text-2xl font-semibold tabular-nums">{consumption?.totalUsage?.toLocaleString() || '0'}</CardTitle>
            </CardHeader>
            <CardFooter className="text-sm text-muted-foreground">
              <MessageSquare className="h-3.5 w-3.5 mr-1.5 text-amber-500" />
              Messages consumed
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
          {/* Send Message */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2"><Send className="h-4 w-4 text-primary" /> Push Message</CardTitle>
              <CardDescription>Send a text message to a user, group, or room</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Input
                value={to}
                onChange={(e) => setTo(e.target.value)}
                placeholder="User/Group ID (e.g. U1234...)"
              />
              <Textarea
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                placeholder="Message text..."
                className="min-h-[80px]"
              />
              <Button
               
                onClick={handleSend}
                disabled={sending || !to.trim() || !messageText.trim()}
              >
                {sending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Send className="h-4 w-4 mr-2" />}
                Send Message
              </Button>
            </CardContent>
          </Card>

          {/* Bot Info */}
          {botInfo && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2"><Bot className="h-4 w-4 text-primary" /> Bot Information</CardTitle>
              </CardHeader>
              <CardContent>
                <JsonViewer data={botInfo} />
              </CardContent>
            </Card>
          )}

          {/* Last Result */}
          {lastResult && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Last Send Result</CardTitle>
              </CardHeader>
              <CardContent>
                <JsonViewer data={lastResult} />
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
