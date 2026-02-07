import { Wrench } from 'lucide-react';
import { useConnection } from '@node2flow/dashboard-core';

export default function WorkflowTools() {
  const { activeConnection } = useConnection();

  if (!activeConnection) {
    return (
      <div className="card text-center py-12">
        <Wrench className="h-12 w-12 text-n2f-text-muted mx-auto mb-4" />
        <h3 className="text-lg font-medium text-n2f-text mb-2">No connection selected</h3>
        <p className="text-n2f-text-secondary">Add a cl-n8n-mcp connection first to use workflow tools.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-n2f-text">Workflow Tools</h1>
        <p className="text-n2f-text-secondary mt-1">Create, validate, and fix n8n workflows</p>
      </div>
      <div className="card p-8 text-center">
        <Wrench className="h-12 w-12 text-n2f-accent mx-auto mb-4" />
        <h3 className="text-lg font-medium text-n2f-text mb-2">Use MCP to build workflows</h3>
        <p className="text-n2f-text-secondary max-w-md mx-auto">
          Ask your AI assistant: <em className="text-n2f-text">"Create a webhook workflow that sends Slack notifications"</em> or{' '}
          <em className="text-n2f-text">"Validate and fix workflow #123"</em>
        </p>
      </div>
    </div>
  );
}
