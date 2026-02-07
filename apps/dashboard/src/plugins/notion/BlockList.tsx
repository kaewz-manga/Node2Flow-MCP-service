import { LayoutList } from 'lucide-react';
import { useConnection } from '@node2flow/dashboard-core';

export default function BlockList() {
  const { activeConnection } = useConnection();

  if (!activeConnection) {
    return (
      <div className="card text-center py-12">
        <LayoutList className="h-12 w-12 text-n2f-text-muted mx-auto mb-4" />
        <h3 className="text-lg font-medium text-n2f-text mb-2">No connection selected</h3>
        <p className="text-n2f-text-secondary">Add a Notion connection first to manage blocks.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-n2f-text">Blocks & Content</h1>
        <p className="text-n2f-text-secondary mt-1">Manage page content blocks via MCP tools</p>
      </div>
      <div className="card p-8 text-center">
        <LayoutList className="h-12 w-12 text-n2f-accent mx-auto mb-4" />
        <h3 className="text-lg font-medium text-n2f-text mb-2">Use MCP to manage content</h3>
        <p className="text-n2f-text-secondary max-w-md mx-auto">
          Ask your AI assistant: <em className="text-n2f-text">"Read the content of page [ID]"</em> or{' '}
          <em className="text-n2f-text">"Add a paragraph to my page"</em>
        </p>
      </div>
    </div>
  );
}
