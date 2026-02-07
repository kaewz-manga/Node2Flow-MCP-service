import { FileCode } from 'lucide-react';
import { useConnection } from '@node2flow/dashboard-core';

export default function Templates() {
  const { activeConnection } = useConnection();

  if (!activeConnection) {
    return (
      <div className="card text-center py-12">
        <FileCode className="h-12 w-12 text-n2f-text-muted mx-auto mb-4" />
        <h3 className="text-lg font-medium text-n2f-text mb-2">No connection selected</h3>
        <p className="text-n2f-text-secondary">Add a cl-n8n-mcp connection first to browse templates.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-n2f-text">Workflow Templates</h1>
        <p className="text-n2f-text-secondary mt-1">Browse and deploy n8n.io workflow templates</p>
      </div>
      <div className="card p-8 text-center">
        <FileCode className="h-12 w-12 text-n2f-accent mx-auto mb-4" />
        <h3 className="text-lg font-medium text-n2f-text mb-2">Use MCP to browse templates</h3>
        <p className="text-n2f-text-secondary max-w-md mx-auto">
          Ask your AI assistant: <em className="text-n2f-text">"Search for Slack integration templates"</em> or{' '}
          <em className="text-n2f-text">"Deploy template #1234 to my n8n"</em>
        </p>
      </div>
    </div>
  );
}
