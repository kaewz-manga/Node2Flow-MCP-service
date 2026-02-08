import { Menu } from 'lucide-react';
import { useConnection } from '@node2flow/dashboard-core';
import { Card, CardContent } from '@/components/ui/card';

export default function RichMenuList() {
  const { activeConnection } = useConnection();

  if (!activeConnection) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <Menu className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">No connection selected</h3>
          <p className="text-muted-foreground">Add a LINE Bot connection first to manage rich menus.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Rich Menus</h1>
        <p className="text-muted-foreground mt-1">Manage LINE rich menus via MCP tools</p>
      </div>
      <Card>
        <CardContent className="p-8 text-center">
          <Menu className="h-12 w-12 text-primary mx-auto mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">Use MCP to manage rich menus</h3>
          <p className="text-muted-foreground max-w-md mx-auto">
            Ask your AI assistant: <em className="text-foreground">"List all my rich menus"</em> or{' '}
            <em className="text-foreground">"Create a new rich menu for my bot"</em>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
