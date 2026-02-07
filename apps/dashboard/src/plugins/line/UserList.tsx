import { Users } from 'lucide-react';
import { useConnection } from '@node2flow/dashboard-core';

export default function UserList() {
  const { activeConnection } = useConnection();

  if (!activeConnection) {
    return (
      <div className="card text-center py-12">
        <Users className="h-12 w-12 text-n2f-text-muted mx-auto mb-4" />
        <h3 className="text-lg font-medium text-n2f-text mb-2">No connection selected</h3>
        <p className="text-n2f-text-secondary">Add a LINE Bot connection first to manage users and groups.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-n2f-text">Users & Groups</h1>
        <p className="text-n2f-text-secondary mt-1">View LINE user profiles and group information via MCP tools</p>
      </div>
      <div className="card p-8 text-center">
        <Users className="h-12 w-12 text-n2f-accent mx-auto mb-4" />
        <h3 className="text-lg font-medium text-n2f-text mb-2">Use MCP to manage users</h3>
        <p className="text-n2f-text-secondary max-w-md mx-auto">
          Ask your AI assistant: <em className="text-n2f-text">"Get profile for user U1234"</em> or{' '}
          <em className="text-n2f-text">"List group members in group C5678"</em>
        </p>
      </div>
    </div>
  );
}
