import { FileText } from 'lucide-react';
import { useConnection } from '@node2flow/dashboard-core';

export default function PageList() {
  const { activeConnection } = useConnection();

  if (!activeConnection) {
    return (
      <div className="card text-center py-12">
        <FileText className="h-12 w-12 text-n2f-text-muted mx-auto mb-4" />
        <h3 className="text-lg font-medium text-n2f-text mb-2">No connection selected</h3>
        <p className="text-n2f-text-secondary">Add a Notion connection first to browse pages.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-n2f-text">Pages</h1>
        <p className="text-n2f-text-secondary mt-1">Search and manage your Notion pages via MCP tools</p>
      </div>
      <div className="card p-8 text-center">
        <FileText className="h-12 w-12 text-n2f-accent mx-auto mb-4" />
        <h3 className="text-lg font-medium text-n2f-text mb-2">Use MCP to manage pages</h3>
        <p className="text-n2f-text-secondary max-w-md mx-auto">
          Ask your AI assistant: <em className="text-n2f-text">"Search for pages about Meeting Notes"</em> or{' '}
          <em className="text-n2f-text">"Create a new page in my Projects database"</em>
        </p>
      </div>
    </div>
  );
}
