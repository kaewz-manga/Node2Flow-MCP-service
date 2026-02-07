import { Search } from 'lucide-react';
import { useConnection } from '@node2flow/dashboard-core';

export default function NodeExplorer() {
  const { activeConnection } = useConnection();

  if (!activeConnection) {
    return (
      <div className="card text-center py-12">
        <Search className="h-12 w-12 text-n2f-text-muted mx-auto mb-4" />
        <h3 className="text-lg font-medium text-n2f-text mb-2">No connection selected</h3>
        <p className="text-n2f-text-secondary">Add a cl-n8n-mcp connection first to explore nodes.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-n2f-text">Node Explorer</h1>
        <p className="text-n2f-text-secondary mt-1">Search and explore 500+ n8n nodes</p>
      </div>
      <div className="card p-8 text-center">
        <Search className="h-12 w-12 text-n2f-accent mx-auto mb-4" />
        <h3 className="text-lg font-medium text-n2f-text mb-2">Use MCP to explore nodes</h3>
        <p className="text-n2f-text-secondary max-w-md mx-auto">
          Ask your AI assistant: <em className="text-n2f-text">"Search for webhook nodes"</em> or{' '}
          <em className="text-n2f-text">"Show me the HTTP Request node documentation"</em>
        </p>
      </div>
    </div>
  );
}
