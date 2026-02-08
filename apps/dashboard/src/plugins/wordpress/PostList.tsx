import { FileText } from 'lucide-react';
import { useConnection, Card, CardContent } from '@node2flow/dashboard-core';



export default function PostList() {
  const { activeConnection } = useConnection();

  if (!activeConnection) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">No connection selected</h3>
          <p className="text-muted-foreground">Add a WordPress connection first to manage posts.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Posts</h1>
        <p className="text-muted-foreground mt-1">Manage WordPress posts via MCP tools</p>
      </div>
      <Card>
        <CardContent className="p-8 text-center">
          <FileText className="h-12 w-12 text-primary mx-auto mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">Use MCP to manage posts</h3>
          <p className="text-muted-foreground max-w-md mx-auto">
            Ask your AI assistant: <em className="text-foreground">"List all my WordPress posts"</em> or{' '}
            <em className="text-foreground">"Create a new draft post about Node2Flow"</em>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
