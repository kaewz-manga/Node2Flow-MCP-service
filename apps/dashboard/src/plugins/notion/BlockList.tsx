import { LayoutList } from 'lucide-react';
import { useConnection, Card, CardContent } from '@node2flow/dashboard-core';



export default function BlockList() {
  const { activeConnection } = useConnection();

  if (!activeConnection) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <LayoutList className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">No connection selected</h3>
          <p className="text-muted-foreground">Add a Notion connection first to manage blocks.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Blocks & Content</h1>
        <p className="text-muted-foreground mt-1">Manage page content blocks via MCP tools</p>
      </div>
      <Card>
        <CardContent className="p-8 text-center">
          <LayoutList className="h-12 w-12 text-primary mx-auto mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">Use MCP to manage content</h3>
          <p className="text-muted-foreground max-w-md mx-auto">
            Ask your AI assistant: <em className="text-foreground">"Read the content of page [ID]"</em> or{' '}
            <em className="text-foreground">"Add a paragraph to my page"</em>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
