import { File } from 'lucide-react';
import { useConnection } from '@node2flow/dashboard-core';

export default function PageList() {
  const { activeConnection } = useConnection();

  if (!activeConnection) {
    return (
      <div className="card text-center py-12">
        <File className="h-12 w-12 text-n2f-text-muted mx-auto mb-4" />
        <h3 className="text-lg font-medium text-n2f-text mb-2">No connection selected</h3>
        <p className="text-n2f-text-secondary">Add a WordPress connection first to manage pages.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-n2f-text">Pages</h1>
        <p className="text-n2f-text-secondary mt-1">Manage WordPress pages via MCP tools</p>
      </div>
      <div className="card p-8 text-center">
        <File className="h-12 w-12 text-n2f-accent mx-auto mb-4" />
        <h3 className="text-lg font-medium text-n2f-text mb-2">Use MCP to manage pages</h3>
        <p className="text-n2f-text-secondary max-w-md mx-auto">
          Ask your AI assistant: <em className="text-n2f-text">"List all my WordPress pages"</em> or{' '}
          <em className="text-n2f-text">"Create a new About Us page"</em>
        </p>
      </div>
    </div>
  );
}
