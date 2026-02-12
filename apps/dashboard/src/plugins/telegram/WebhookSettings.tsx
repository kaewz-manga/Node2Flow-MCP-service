import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { tgGetWebhookInfo, tgSetWebhook, tgDeleteWebhook } from '../../lib/gateway-api';
import { usePluginConnection, Button, Input, Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter, Alert, AlertDescription, Separator, Badge } from '@node2flow/dashboard-core';
import ConfirmDialog from '../n8n/components/ConfirmDialog';
import JsonViewer from '../n8n/components/JsonViewer';
import { Loader2, RefreshCw, AlertCircle, Webhook, CheckCircle2, XCircle, Trash2 } from 'lucide-react';

export default function WebhookSettings() {
  const activeConnection = usePluginConnection('telegram');
  const connectionId = activeConnection?.id;
  const [webhookInfo, setWebhookInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteTarget, setDeleteTarget] = useState(false);

  // Set Webhook form
  const [webhookUrl, setWebhookUrl] = useState('');
  const [setting, setSetting] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function fetchWebhookInfo() {
    if (!connectionId) return;
    setLoading(true);
    setError('');
    const res = await tgGetWebhookInfo(connectionId);
    if (res.success && res.data) {
      const d = res.data as any;
      setWebhookInfo(d);
      if (d.url) {
        setWebhookUrl(d.url);
      }
    } else {
      setError(res.error?.message || 'Failed to fetch webhook info');
    }
    setLoading(false);
  }

  useEffect(() => {
    if (connectionId) fetchWebhookInfo();
  }, [connectionId]);

  async function handleSetWebhook() {
    if (!webhookUrl.trim() || !connectionId) return;
    setSetting(true);
    const res = await tgSetWebhook(connectionId, webhookUrl.trim());
    if (res.success) {
      toast.success('Webhook set successfully');
      fetchWebhookInfo();
    } else {
      toast.error(res.error?.message || 'Failed to set webhook');
    }
    setSetting(false);
  }

  async function handleDeleteWebhook() {
    if (!connectionId) return;
    setDeleting(true);
    const res = await tgDeleteWebhook(connectionId, true);
    if (res.success) {
      toast.success('Webhook deleted successfully');
      setDeleteTarget(false);
      setWebhookUrl('');
      fetchWebhookInfo();
    } else {
      toast.error(res.error?.message || 'Failed to delete webhook');
    }
    setDeleting(false);
  }

  if (!activeConnection) {
    return <div className="text-center py-12 text-muted-foreground">No connection selected. Please select a connection from the sidebar.</div>;
  }

  const hasWebhook = webhookInfo?.url && webhookInfo.url !== '';
  const pendingUpdates = webhookInfo?.pending_update_count || 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Webhook Settings</h1>
          <p className="text-muted-foreground mt-1">{activeConnection.name} - Configure Telegram webhooks</p>
        </div>
        <Button variant="outline" size="icon" onClick={fetchWebhookInfo} title="Refresh">
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {loading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      ) : (
        <>
          {/* Stat Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="bg-gradient-to-t from-primary/5 to-card shadow-sm">
              <CardHeader className="pb-2">
                <CardDescription>Webhook Status</CardDescription>
                <CardTitle className="text-xl font-semibold flex items-center gap-2">
                  {hasWebhook ? (
                    <>
                      <CheckCircle2 className="h-5 w-5 text-primary" />
                      <span>Active</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="h-5 w-5 text-muted-foreground" />
                      <span>Not Set</span>
                    </>
                  )}
                </CardTitle>
              </CardHeader>
              <CardFooter className="text-sm text-muted-foreground">
                <Webhook className="h-3.5 w-3.5 mr-1.5 text-primary" />
                {hasWebhook ? 'Receiving updates' : 'Using long polling'}
              </CardFooter>
            </Card>

            <Card className="bg-gradient-to-t from-primary/5 to-card shadow-sm">
              <CardHeader className="pb-2">
                <CardDescription>Pending Updates</CardDescription>
                <CardTitle className="text-2xl font-semibold tabular-nums">{pendingUpdates}</CardTitle>
              </CardHeader>
              <CardFooter className="text-sm text-muted-foreground">
                <AlertCircle className="h-3.5 w-3.5 mr-1.5 text-primary" />
                Unprocessed messages
              </CardFooter>
            </Card>

            <Card className="bg-gradient-to-t from-amber-500/5 to-card shadow-sm">
              <CardHeader className="pb-2">
                <CardDescription>Current URL</CardDescription>
                <CardTitle className="text-base font-semibold truncate">
                  {hasWebhook ? webhookInfo.url : 'Not configured'}
                </CardTitle>
              </CardHeader>
              <CardFooter className="text-sm text-muted-foreground">
                <Webhook className="h-3.5 w-3.5 mr-1.5 text-amber-500" />
                Webhook endpoint
              </CardFooter>
            </Card>
          </div>

          {webhookInfo?.last_error_message && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <div className="font-semibold">Last Error:</div>
                <div className="text-sm mt-1">{webhookInfo.last_error_message}</div>
                {webhookInfo.last_error_date && (
                  <div className="text-xs mt-1 opacity-80">
                    {new Date(webhookInfo.last_error_date * 1000).toLocaleString()}
                  </div>
                )}
              </AlertDescription>
            </Alert>
          )}

          <Separator />

          {/* Set Webhook Form */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Webhook className="h-5 w-5 text-primary" />
                Set Webhook
              </CardTitle>
              <CardDescription>
                Configure the HTTPS URL where Telegram will send updates
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">Webhook URL</label>
                <Input
                  value={webhookUrl}
                  onChange={(e) => setWebhookUrl(e.target.value)}
                  placeholder="https://your-domain.com/webhook/telegram"
                  className="font-mono"
                />
                <p className="text-xs text-muted-foreground mt-1.5">
                  Must be HTTPS. Telegram will POST updates to this URL.
                </p>
              </div>
              <div className="flex gap-3">
                <Button
                  className=""
                  onClick={handleSetWebhook}
                  disabled={setting || !webhookUrl.trim()}
                >
                  {setting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Webhook className="h-4 w-4 mr-2" />}
                  Set Webhook
                </Button>
                {hasWebhook && (
                  <Button
                    variant="destructive"
                    onClick={() => setDeleteTarget(true)}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Webhook
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Full Webhook Info */}
          {webhookInfo && (
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-foreground">Full Webhook Information</h3>
              <JsonViewer data={webhookInfo} title="Webhook Data" />
            </div>
          )}
        </>
      )}

      <ConfirmDialog
        open={deleteTarget}
        title="Delete Webhook"
        message="Delete the current webhook configuration? The bot will switch to long polling mode. Pending updates will be dropped."
        onConfirm={handleDeleteWebhook}
        onCancel={() => setDeleteTarget(false)}
      />
    </div>
  );
}
