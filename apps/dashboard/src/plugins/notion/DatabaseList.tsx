import { Database } from 'lucide-react';
import { useConnection } from '@node2flow/dashboard-core';

export default function DatabaseList() {
  const { activeConnection } = useConnection();

  if (!activeConnection) {
    return (
      <div className="card text-center py-12">
        <Database className="h-12 w-12 text-n2f-text-muted mx-auto mb-4" />
        <h3 className="text-lg font-medium text-n2f-text mb-2">No connection selected</h3>
        <p className="text-n2f-text-secondary">Add a Notion connection first to browse databases.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-n2f-text">Databases & Data Sources</h1>
        <p className="text-n2f-text-secondary mt-1">Browse and query your Notion databases via MCP tools</p>
      </div>
      <div className="card p-8 text-center">
        <Database className="h-12 w-12 text-n2f-accent mx-auto mb-4" />
        <h3 className="text-lg font-medium text-n2f-text mb-2">Use MCP to manage databases</h3>
        <p className="text-n2f-text-secondary max-w-md mx-auto">
          Ask your AI assistant: <em className="text-n2f-text">"Search for databases in my workspace"</em> or{' '}
          <em className="text-n2f-text">"Query my Tasks database where status is In Progress"</em>
        </p>
      </div>
    </div>
  );
}
