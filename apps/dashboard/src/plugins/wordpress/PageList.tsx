import { File } from 'lucide-react';
import { useConnection } from '@node2flow/dashboard-core';
import { Card, CardContent } from '@/components/ui/card';

export default function PageList() {
  const { activeConnection } = useConnection();

  if (!activeConnection) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <File className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">No connection selected</h3>
          <p className="text-muted-foreground">Add a WordPress connection first to manage pages.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Pages</h1>
        <p className="text-muted-foreground mt-1">Manage WordPress pages via MCP tools</p>
      </div>
      <Card>
        <CardContent className="p-8 text-center">
          <File className="h-12 w-12 text-primary mx-auto mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">Use MCP to manage pages</h3>
          <p className="text-muted-foreground max-w-md mx-auto">
            Ask your AI assistant: <em className="text-foreground">"List all my WordPress pages"</em> or{' '}
            <em className="text-foreground">"Create a new About Us page"</em>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
