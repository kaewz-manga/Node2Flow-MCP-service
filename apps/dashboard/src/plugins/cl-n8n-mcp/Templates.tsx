import { FileCode } from 'lucide-react';
import { useConnection } from '@node2flow/dashboard-core';
import { Card, CardContent } from '@/components/ui/card';

export default function Templates() {
  const { activeConnection } = useConnection();

  if (!activeConnection) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <FileCode className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">No connection selected</h3>
          <p className="text-muted-foreground">Add a cl-n8n-mcp connection first to browse templates.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Workflow Templates</h1>
        <p className="text-muted-foreground mt-1">Browse and deploy n8n.io workflow templates</p>
      </div>
      <Card>
        <CardContent className="p-8 text-center">
          <FileCode className="h-12 w-12 text-primary mx-auto mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">Use MCP to browse templates</h3>
          <p className="text-muted-foreground max-w-md mx-auto">
            Ask your AI assistant: <em className="text-foreground">"Search for Slack integration templates"</em> or{' '}
            <em className="text-foreground">"Deploy template #1234 to my n8n"</em>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
