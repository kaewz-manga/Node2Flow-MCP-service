import { FileCode } from 'lucide-react';
import { useConnection, Card, CardContent, CardHeader, CardTitle, CardDescription, Separator } from '@node2flow/dashboard-core';



export default function Templates() {
  const { activeConnection } = useConnection();

  if (!activeConnection) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <h3 className="text-lg font-medium text-foreground mb-2">No connection selected</h3>
          <p className="text-sm text-muted-foreground">Select a connection from the sidebar to continue.</p>
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
      <Separator />
      <Card className="hover:shadow-md transition-all">
        <CardHeader>
          <CardTitle className="text-base">Use MCP tools</CardTitle>
          <CardDescription>Browse and deploy workflow templates through your AI assistant</CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><em className="text-foreground">"Search for Slack integration templates"</em></li>
            <li><em className="text-foreground">"Deploy template #1234 to my n8n"</em></li>
            <li><em className="text-foreground">"Show me automation templates for email"</em></li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
