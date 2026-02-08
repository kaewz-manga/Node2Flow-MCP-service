import { Database } from 'lucide-react';
import { useConnection, Card, CardContent, CardHeader, CardTitle, CardDescription, Separator } from '@node2flow/dashboard-core';



export default function DatabaseList() {
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
        <h1 className="text-2xl font-bold text-foreground">Databases & Data Sources</h1>
        <p className="text-muted-foreground mt-1">Browse and query your Notion databases via MCP tools</p>
      </div>
      <Separator />
      <Card className="hover:shadow-md transition-all">
        <CardHeader>
          <CardTitle className="text-base">Use MCP tools</CardTitle>
          <CardDescription>Manage Notion databases through your AI assistant</CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><em className="text-foreground">"Search for databases in my workspace"</em></li>
            <li><em className="text-foreground">"Query my Tasks database where status is In Progress"</em></li>
            <li><em className="text-foreground">"Create a new entry in my CRM database"</em></li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
