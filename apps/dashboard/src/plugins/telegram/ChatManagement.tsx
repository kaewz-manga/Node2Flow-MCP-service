import { Users } from 'lucide-react';
import { useConnection } from '@node2flow/dashboard-core';

export default function ChatManagement() {
  const { activeConnection } = useConnection();

  if (!activeConnection) {
    return (
      <div className="card text-center py-12">
        <Users className="h-12 w-12 text-n2f-text-muted mx-auto mb-4" />
        <h3 className="text-lg font-medium text-n2f-text mb-2">No connection selected</h3>
        <p className="text-n2f-text-secondary">Add a Telegram Bot connection first to manage chats.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-n2f-text">Chat Management</h1>
        <p className="text-n2f-text-secondary mt-1">Manage Telegram chats and members via MCP tools</p>
      </div>
      <div className="card p-8 text-center">
        <Users className="h-12 w-12 text-n2f-accent mx-auto mb-4" />
        <h3 className="text-lg font-medium text-n2f-text mb-2">Use MCP to manage chats</h3>
        <p className="text-n2f-text-secondary max-w-md mx-auto">
          Ask your AI assistant: <em className="text-n2f-text">"Get info about chat -100123"</em> or{' '}
          <em className="text-n2f-text">"Ban user 456 from the group"</em>
        </p>
      </div>
    </div>
  );
}
