import { Globe } from 'lucide-react';
import { useConnection, Card, CardContent } from '@node2flow/dashboard-core';



export default function WebhookSettings() {
  const { activeConnection } = useConnection();

  if (!activeConnection) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <Globe className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">No connection selected</h3>
          <p className="text-muted-foreground">Add a Telegram Bot connection first to manage webhooks.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Webhook Settings</h1>
        <p className="text-muted-foreground mt-1">Manage Telegram webhook endpoints via MCP tools</p>
      </div>
      <Card>
        <CardContent className="p-8 text-center">
          <Globe className="h-12 w-12 text-primary mx-auto mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">Use MCP to manage webhooks</h3>
          <p className="text-muted-foreground max-w-md mx-auto">
            Ask your AI assistant: <em className="text-foreground">"Set webhook to https://myserver.com/webhook"</em> or{' '}
            <em className="text-foreground">"Check my webhook status"</em>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
