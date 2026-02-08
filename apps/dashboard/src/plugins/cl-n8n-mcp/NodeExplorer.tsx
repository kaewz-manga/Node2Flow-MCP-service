import { Search } from 'lucide-react';
import { useConnection, Card, CardContent } from '@node2flow/dashboard-core';



export default function NodeExplorer() {
  const { activeConnection } = useConnection();

  if (!activeConnection) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">No connection selected</h3>
          <p className="text-muted-foreground">Add a cl-n8n-mcp connection first to explore nodes.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Node Explorer</h1>
        <p className="text-muted-foreground mt-1">Search and explore 500+ n8n nodes</p>
      </div>
      <Card>
        <CardContent className="p-8 text-center">
          <Search className="h-12 w-12 text-primary mx-auto mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">Use MCP to explore nodes</h3>
          <p className="text-muted-foreground max-w-md mx-auto">
            Ask your AI assistant: <em className="text-foreground">"Search for webhook nodes"</em> or{' '}
            <em className="text-foreground">"Show me the HTTP Request node documentation"</em>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
