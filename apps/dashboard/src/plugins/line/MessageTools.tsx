import { Send } from 'lucide-react';
import { useConnection } from '@node2flow/dashboard-core';

export default function MessageTools() {
  const { activeConnection } = useConnection();

  if (!activeConnection) {
    return (
      <div className="card text-center py-12">
        <Send className="h-12 w-12 text-n2f-text-muted mx-auto mb-4" />
        <h3 className="text-lg font-medium text-n2f-text mb-2">No connection selected</h3>
        <p className="text-n2f-text-secondary">Add a LINE Bot connection first to send messages.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-n2f-text">Message Tools</h1>
        <p className="text-n2f-text-secondary mt-1">Send and manage LINE messages via MCP tools</p>
      </div>
      <div className="card p-8 text-center">
        <Send className="h-12 w-12 text-n2f-accent mx-auto mb-4" />
        <h3 className="text-lg font-medium text-n2f-text mb-2">Use MCP to send messages</h3>
        <p className="text-n2f-text-secondary max-w-md mx-auto">
          Ask your AI assistant: <em className="text-n2f-text">"Send a text message to user U1234"</em> or{' '}
          <em className="text-n2f-text">"Broadcast a message to all followers"</em>
        </p>
      </div>
    </div>
  );
}
