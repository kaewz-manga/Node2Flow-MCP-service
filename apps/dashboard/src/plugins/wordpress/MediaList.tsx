import { Image } from 'lucide-react';
import { useConnection } from '@node2flow/dashboard-core';

export default function MediaList() {
  const { activeConnection } = useConnection();

  if (!activeConnection) {
    return (
      <div className="card text-center py-12">
        <Image className="h-12 w-12 text-n2f-text-muted mx-auto mb-4" />
        <h3 className="text-lg font-medium text-n2f-text mb-2">No connection selected</h3>
        <p className="text-n2f-text-secondary">Add a WordPress connection first to manage media.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-n2f-text">Media Library</h1>
        <p className="text-n2f-text-secondary mt-1">Manage WordPress media via MCP tools</p>
      </div>
      <div className="card p-8 text-center">
        <Image className="h-12 w-12 text-n2f-accent mx-auto mb-4" />
        <h3 className="text-lg font-medium text-n2f-text mb-2">Use MCP to manage media</h3>
        <p className="text-n2f-text-secondary max-w-md mx-auto">
          Ask your AI assistant: <em className="text-n2f-text">"List all images in my WordPress media library"</em>
        </p>
      </div>
    </div>
  );
}
