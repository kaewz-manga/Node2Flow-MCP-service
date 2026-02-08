import { Wrench } from 'lucide-react';
import { useConnection } from '@node2flow/dashboard-core';
import { Card, CardContent } from '@/components/ui/card';

export default function WorkflowTools() {
  const { activeConnection } = useConnection();

  if (!activeConnection) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <Wrench className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">No connection selected</h3>
          <p className="text-muted-foreground">Add a cl-n8n-mcp connection first to use workflow tools.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Workflow Tools</h1>
        <p className="text-muted-foreground mt-1">Create, validate, and fix n8n workflows</p>
      </div>
      <Card>
        <CardContent className="p-8 text-center">
          <Wrench className="h-12 w-12 text-primary mx-auto mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">Use MCP to build workflows</h3>
          <p className="text-muted-foreground max-w-md mx-auto">
            Ask your AI assistant: <em className="text-foreground">"Create a webhook workflow that sends Slack notifications"</em> or{' '}
            <em className="text-foreground">"Validate and fix workflow #123"</em>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
