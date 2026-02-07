import { Globe } from 'lucide-react';
import { useConnection } from '@node2flow/dashboard-core';

export default function WebhookSettings() {
  const { activeConnection } = useConnection();

  if (!activeConnection) {
    return (
      <div className="card text-center py-12">
        <Globe className="h-12 w-12 text-n2f-text-muted mx-auto mb-4" />
        <h3 className="text-lg font-medium text-n2f-text mb-2">No connection selected</h3>
        <p className="text-n2f-text-secondary">Add a Telegram Bot connection first to manage webhooks.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-n2f-text">Webhook Settings</h1>
        <p className="text-n2f-text-secondary mt-1">Manage Telegram webhook endpoints via MCP tools</p>
      </div>
      <div className="card p-8 text-center">
        <Globe className="h-12 w-12 text-n2f-accent mx-auto mb-4" />
        <h3 className="text-lg font-medium text-n2f-text mb-2">Use MCP to manage webhooks</h3>
        <p className="text-n2f-text-secondary max-w-md mx-auto">
          Ask your AI assistant: <em className="text-n2f-text">"Set webhook to https://myserver.com/webhook"</em> or{' '}
          <em className="text-n2f-text">"Check my webhook status"</em>
        </p>
      </div>
    </div>
  );
}
